const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Chocolates', 'Nuts', 'Dates', 'Others'],
    required: true
  },
  description: { type: String, required: true },
  quantity: { type: String, required: true },
  priority: String,
  status: {
    type: String,
    enum: ['pending', 'rejected', 'released'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: { type: Date, default: Date.now }
});

const StockRequest = mongoose.model('StockRequest', stockRequestSchema);
module.exports = StockRequest;
