const mongoose = require('mongoose');

/**
 * Payment Schema
 * Stores payment information for orders
 */
const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  payment_method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  payment_id: {
    type: String,
    required: [true, 'Payment ID from payment processor is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transaction_data: {
    type: Object,
    default: {}
  },
  refund_data: {
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
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ payment_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ created_at: 1 });

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
  // This would be implemented with actual payment gateway integration
  // For now, just update the status and refund data
  
  if (amount > this.amount) {
    throw new Error('Refund amount cannot be greater than payment amount');
  }
  
  const isFullRefund = amount === this.amount;
  
  this.status = isFullRefund ? 'refunded' : 'partially_refunded';
  this.refund_data = {
    amount: amount,
    reason: reason,
    date: new Date(),
    is_full_refund: isFullRefund
  };
  
  return await this.save();
};

// Create model from schema
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;