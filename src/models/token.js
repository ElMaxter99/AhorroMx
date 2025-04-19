'use strict';

const mongoose = require('mongoose');

const { TYPES } = require('../enums/token');

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date },
  valid: { type: Boolean, default: true },
  type: { type: String, enum: Object.values(TYPES) }
}, { timestamps: true });

// tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Limpieza automática

module.exports = mongoose.model('Token', tokenSchema);
