const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contribution', default: [] }],
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
