const mongoose = require('mongoose');

const { STATUS } = require('../enums/contribution');

const contributionSchema = new mongoose.Schema(
  {
    expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: Object.values(STATUS), default: STATUS.PENDING },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contribution', contributionSchema);
