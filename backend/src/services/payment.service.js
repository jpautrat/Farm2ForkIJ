/**
 * Payment service
 * Handles payment-related business logic
 */
const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const orderService = require('./order.service');
const mongoose = require('mongoose');
const config = require('../config');
const stripe = require('stripe')(config.stripe.secretKey);

class PaymentService {
  /**
   * Create a payment intent for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Payment intent object
   */
  async createPaymentIntent(orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get order
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.payment_status === 'paid') {
        throw new Error('Order is already paid');
      }

      // Check if payment already exists
      const existingPayment = await Payment.findOne({ order_id: orderId }).session(session);

      if (existingPayment && existingPayment.status === 'succeeded') {
        throw new Error('Payment already processed');
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convert to cents and ensure integer
        currency: 'usd',
        metadata: { orderId: order._id.toString() },
        description: `Payment for order ${order._id}`,
        receipt_email: order.email // Assuming order has customer email
      });

      // Create or update payment record
      let payment;

      if (existingPayment) {
        // Update existing payment
        existingPayment.payment_id = paymentIntent.id;
        existingPayment.amount = order.total_amount;
        existingPayment.status = 'pending';
        existingPayment.client_secret = paymentIntent.client_secret;
        payment = await existingPayment.save({ session });
      } else {
        // Create new payment
        payment = new Payment({
          order_id: order._id,
          payment_method: 'card', // Default to card
          payment_id: paymentIntent.id,
          amount: order.total_amount,
          status: 'pending',
          client_secret: paymentIntent.client_secret
        });

        payment = await payment.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return {
        paymentId: payment._id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: order.total_amount
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Process payment webhook
   * @param {Object} payload - Raw request payload
   * @param {string} signature - Stripe signature header
   * @returns {Promise<Object>} - Updated payment object
   */
  async processPaymentWebhook(payload, signature) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

      // Extract payment intent ID from the event
      const paymentIntentId = event.data.object.id;

      // Find payment by payment intent ID
      const payment = await Payment.findOne({ payment_id: paymentIntentId }).session(session);

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update payment status based on event type
      switch (event.type) {
        case 'payment_intent.succeeded':
          payment.status = 'succeeded';
          break;
        case 'payment_intent.payment_failed':
          payment.status = 'failed';
          break;
        default:
          // Ignore other event types
          await session.abortTransaction();
          session.endSession();
          return { received: true };
      }

      await payment.save({ session });

      // Update order payment status
      const order = await Order.findById(payment.order_id).session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      order.payment_status = payment.status === 'succeeded' ? 'paid' : 'failed';
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { received: true, payment };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Confirm payment (for client-side confirmation)
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} - Updated payment object
   */
  async confirmPayment(paymentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find payment
      const payment = await Payment.findById(paymentId).session(session);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'succeeded') {
        throw new Error('Payment already succeeded');
      }

      // Retrieve payment intent from Stripe to check its status
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.payment_id);

      // Use the status from the payment intent
      const result = {
        id: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      };

      // Update payment status
      payment.status = result.status;
      await payment.save({ session });

      // Update order payment status
      const order = await Order.findById(payment.order_id).session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      order.payment_status = result.status === 'succeeded' ? 'paid' : 'failed';

      // If payment succeeded, update order status to processing
      if (result.status === 'succeeded' && order.status === 'pending') {
        order.status = 'processing';
      }

      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        paymentId: payment._id,
        status: payment.status,
        orderId: payment.order_id
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Refund payment
   * @param {string} orderId - Order ID
   * @param {number} amount - Amount to refund (optional, defaults to full amount)
   * @returns {Promise<Object>} - Refund result
   */
  async refundPayment(orderId, amount = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find payment for order
      const payment = await Payment.findOne({ order_id: orderId }).session(session);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'succeeded') {
        throw new Error('Payment cannot be refunded');
      }

      // Get refund amount
      const refundAmount = amount || payment.amount;

      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.payment_id,
        amount: Math.round(refundAmount * 100), // Convert to cents and ensure integer
        reason: 'requested_by_customer'
      });

      // Update payment status
      payment.status = 'refunded';
      await payment.save({ session });

      // Update order payment status
      const order = await Order.findById(payment.order_id).session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      order.payment_status = 'refunded';
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        paymentId: payment._id,
        refundId: refund.id,
        amount: refundAmount,
        status: 'refunded'
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} - Payment object
   */
  async getPaymentById(paymentId) {
    return await Payment.findById(paymentId);
  }

  /**
   * Get payment by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Payment object
   */
  async getPaymentByOrderId(orderId) {
    return await Payment.findOne({ order_id: orderId });
  }
}

module.exports = new PaymentService();
