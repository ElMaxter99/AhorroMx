const mongoose = require('mongoose');
const { TYPE } = require('../enums/movement');

const movementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum:  Object.values(TYPE),
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  relatedGroupExpense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupExpense',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movement', movementSchema);
