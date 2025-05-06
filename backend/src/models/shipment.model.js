const mongoose = require('mongoose');

/**
 * Shipment Schema
 * Stores shipping information for orders
 */
const shipmentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  tracking_number: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    enum: ['usps', 'ups', 'fedex', 'dhl', 'other'],
    required: [true, 'Carrier is required']
  },
  shipping_method: {
    type: String,
    required: [true, 'Shipping method is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  estimated_delivery_date: {
    type: Date
  },
  actual_delivery_date: {
    type: Date
  },
  shipping_label_url: {
    type: String,
    trim: true
  },
  shipping_data: {
    type: Object,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Index for faster queries
shipmentSchema.index({ order_id: 1 });
shipmentSchema.index({ tracking_number: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ carrier: 1 });
shipmentSchema.index({ created_at: 1 });

// Method to update shipment status
shipmentSchema.methods.updateStatus = async function(status, details = {}) {
  this.status = status;
  
  if (status === 'shipped' && !this.tracking_number && details.tracking_number) {
    this.tracking_number = details.tracking_number;
  }
  
  if (status === 'delivered' && !this.actual_delivery_date) {
    this.actual_delivery_date = details.delivery_date || new Date();
  }
  
  // Update shipping data with any additional details
  this.shipping_data = {
    ...this.shipping_data,
    ...details,
    status_history: [
      ...(this.shipping_data.status_history || []),
      {
        status: status,
        date: new Date(),
        details: details
      }
    ]
  };
  
  return await this.save();
};

// Create model from schema
const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;