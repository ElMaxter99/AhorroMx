'use strict';

const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  valid: { type: Boolean, default: true }
}, { timestamps: true });

// tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Limpieza automática

module.exports = mongoose.model('Token', tokenSchema);
