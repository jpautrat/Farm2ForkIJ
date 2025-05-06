/**
 * Shipping service
 * Handles shipping-related business logic
 */
const Shipment = require('../models/shipment.model');
const Order = require('../models/order.model');
const Address = require('../models/address.model');
const mongoose = require('mongoose');
const shippo = require('shippo')(require('../config').shippo.apiKey);

// Real Shippo API integration
const shippingAPI = {
  calculateRates: async (origin, destination, parcel) => {
    try {
      // Create shipment object
      const shipment = {
        address_from: {
          name: origin.name || 'Farm2Fork Seller',
          street1: origin.street,
          city: origin.city,
          state: origin.state,
          zip: origin.zip,
          country: origin.country,
          phone: origin.phone,
          email: origin.email
        },
        address_to: {
          name: destination.name || 'Farm2Fork Customer',
          street1: destination.street,
          city: destination.city,
          state: destination.state,
          zip: destination.zip,
          country: destination.country,
          phone: destination.phone,
          email: destination.email
        },
        parcels: [{
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
          distance_unit: 'in',
          weight: parcel.weight,
          mass_unit: 'lb'
        }],
        async: false
      };

      // Create shipment in Shippo
      const shippoShipment = await shippo.shipment.create(shipment);

      // Return rates
      return shippoShipment.rates.map(rate => ({
        carrier: rate.provider,
        service: rate.servicelevel.name,
        rate: parseFloat(rate.amount),
        estimated_days: rate.estimated_days,
        shipment_id: shippoShipment.object_id,
        rate_id: rate.object_id
      }));
    } catch (error) {
      console.error('Shippo API Error:', error);
      throw new Error(`Error calculating shipping rates: ${error.message}`);
    }
  },

  createLabel: async (rateId, shipmentDetails) => {
    try {
      // Create transaction (purchase label)
      const transaction = await shippo.transaction.create({
        rate: rateId,
        label_file_type: 'PDF',
        async: false
      });

      if (transaction.status !== 'SUCCESS') {
        throw new Error(`Label creation failed: ${transaction.messages[0].text}`);
      }

      return {
        label_url: transaction.label_url,
        tracking_number: transaction.tracking_number,
        carrier: transaction.rate.provider,
        service: transaction.rate.servicelevel.name,
        shipment_id: transaction.rate.shipment
      };
    } catch (error) {
      console.error('Shippo API Error:', error);
      throw new Error(`Error creating shipping label: ${error.message}`);
    }
  },

  trackShipment: async (trackingNumber) => {
    try {
      // Get tracking information
      const tracking = await shippo.track.get(trackingNumber);

      // Format tracking history
      const trackingHistory = tracking.tracking_history.map(history => ({
        status: history.status,
        location: history.location,
        timestamp: new Date(history.status_date)
      }));

      return {
        tracking_number: tracking.tracking_number,
        status: tracking.tracking_status.status,
        carrier: tracking.carrier,
        estimated_delivery: tracking.eta ? new Date(tracking.eta) : null,
        tracking_history: trackingHistory
      };
    } catch (error) {
      console.error('Shippo API Error:', error);

      // If tracking is not found, return a default response
      if (error.message.includes('Not Found')) {
        return {
          tracking_number: trackingNumber,
          status: 'unknown',
          carrier: 'unknown',
          estimated_delivery: null,
          tracking_history: []
        };
      }

      throw new Error(`Error tracking shipment: ${error.message}`);
    }
  }
};

class ShippingService {
  /**
   * Calculate shipping rates
   * @param {string} originAddressId - Origin address ID (seller's address)
   * @param {string} destinationAddressId - Destination address ID (buyer's address)
   * @param {Object} parcel - Parcel details (weight, dimensions)
   * @returns {Promise<Array>} - Array of shipping rates
   */
  async calculateRates(originAddressId, destinationAddressId, parcel) {
    // Get addresses
    const originAddress = await Address.findById(originAddressId);
    const destinationAddress = await Address.findById(destinationAddressId);

    if (!originAddress || !destinationAddress) {
      throw new Error('Origin or destination address not found');
    }

    // Format addresses for shipping API
    const origin = {
      street: originAddress.street_address,
      city: originAddress.city,
      state: originAddress.state,
      zip: originAddress.postal_code,
      country: originAddress.country
    };

    const destination = {
      street: destinationAddress.street_address,
      city: destinationAddress.city,
      state: destinationAddress.state,
      zip: destinationAddress.postal_code,
      country: destinationAddress.country
    };

    // Calculate rates
    const rates = await shippingAPI.calculateRates(origin, destination, parcel);

    return rates;
  }

  /**
   * Create shipment for order
   * @param {string} orderId - Order ID
   * @param {Object} shippingDetails - Shipping details (rate ID, carrier, service)
   * @returns {Promise<Object>} - Created shipment object
   */
  async createShipment(orderId, shippingDetails) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get order
      const order = await Order.findById(orderId)
        .populate('shipping_address_id')
        .session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'processing') {
        throw new Error('Order must be in processing status to create shipment');
      }

      // Check if shipment already exists
      const existingShipment = await Shipment.findOne({ order_id: orderId }).session(session);

      if (existingShipment) {
        throw new Error('Shipment already exists for this order');
      }

      // Create label with shipping API
      const label = await shippingAPI.createLabel(shippingDetails.rateId, {
        carrier: shippingDetails.carrier,
        service: shippingDetails.service,
        shipment_id: shippingDetails.shipmentId
      });

      // Create shipment record
      const shipment = new Shipment({
        order_id: orderId,
        tracking_number: label.tracking_number,
        carrier: label.carrier,
        shipping_method: label.service,
        status: 'pre_transit',
        estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        label_url: label.label_url
      });

      await shipment.save({ session });

      // Update order status
      order.status = 'shipped';
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      return shipment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Track shipment
   * @param {string} trackingNumber - Tracking number
   * @returns {Promise<Object>} - Tracking information
   */
  async trackShipment(trackingNumber) {
    // Get tracking information from shipping API
    const trackingInfo = await shippingAPI.trackShipment(trackingNumber);

    // Find shipment
    const shipment = await Shipment.findOne({ tracking_number: trackingNumber });

    if (shipment) {
      // Update shipment status
      shipment.status = trackingInfo.status;

      if (trackingInfo.status === 'delivered') {
        shipment.actual_delivery_date = new Date();

        // Update order status if shipment is delivered
        const order = await Order.findById(shipment.order_id);
        if (order && order.status === 'shipped') {
          order.status = 'delivered';
          await order.save();
        }
      }

      await shipment.save();
    }

    return trackingInfo;
  }

  /**
   * Get shipment by ID
   * @param {string} shipmentId - Shipment ID
   * @returns {Promise<Object>} - Shipment object
   */
  async getShipmentById(shipmentId) {
    return await Shipment.findById(shipmentId);
  }

  /**
   * Get shipment by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Shipment object
   */
  async getShipmentByOrderId(orderId) {
    return await Shipment.findOne({ order_id: orderId });
  }

  /**
   * Update shipment status
   * @param {string} shipmentId - Shipment ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated shipment object
   */
  async updateShipmentStatus(shipmentId, status) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate status
      if (!['pre_transit', 'in_transit', 'out_for_delivery', 'delivered', 'exception'].includes(status)) {
        throw new Error('Invalid status');
      }

      // Find shipment
      const shipment = await Shipment.findById(shipmentId).session(session);

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Update shipment status
      shipment.status = status;

      if (status === 'delivered') {
        shipment.actual_delivery_date = new Date();

        // Update order status if shipment is delivered
        const order = await Order.findById(shipment.order_id).session(session);
        if (order && order.status === 'shipped') {
          order.status = 'delivered';
          await order.save({ session });
        }
      }

      await shipment.save({ session });

      await session.commitTransaction();
      session.endSession();

      return shipment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get all shipments (admin only)
   * @param {Object} query - Query parameters (pagination, filters)
   * @returns {Promise<Object>} - Shipments and pagination info
   */
  async getAllShipments(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }

    // Add carrier filter if provided
    if (query.carrier) {
      filter.carrier = query.carrier;
    }

    // Add date range filter if provided
    if (query.startDate || query.endDate) {
      filter.created_at = {};
      if (query.startDate) {
        filter.created_at.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.created_at.$lte = new Date(query.endDate);
      }
    }

    const shipments = await Shipment.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Shipment.countDocuments(filter);

    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new ShippingService();
