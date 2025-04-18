'use strict';

const Token = require('../models/token');

const logger = require('../utils/logger');

async function getById (tokenId) {
  try {
    if (!tokenId) {
      throw new Error('Invalid input: tokenId is required!');
    }

    const result = await Token.getById(tokenId);
    return result;
  } catch (error) {
    throw new Error('Error getting token by _id: ', error);
  }
}

async function getToken (token) {
  try {
    if (!token) {
      throw new Error('Invalid input: token is required !');
    }

    const result = await Token.get({ token });
    return result;
  } catch (error) {
    throw new Error('Error getting token:', error);
  }
}

async function getAvalibleToken (userId) {
  try {
    if (!userId) {
      throw new Error('Invalid inout userId is required !');
    }

    const result = await Token.findOne({
      user: userId, // el ObjectId del usuario
      expiresAt: { $gt: new Date() },
      valid: true
    });

    return result;
  } catch (error) {
    throw new Error('Error getting avalible token: ', error);
  }
}

async function createToken (tokenData) {
  try {
    if (!tokenData) {
      throw new Error('Invalid input: tokenData is required !');
    }

    const result = await Token.create(tokenData);
    return result;
  } catch (error) {
    throw new Error('Error creating token:', error);
  }
}

async function invalidateToken (token) {
  try {
    if (!token) {
      throw new Error('Invalid input: token is required !');
    }

    const result = await Token.findOneAndUpdate({ token }, { valid: false }, { new: true });
    return result;
  } catch (error) {
    throw new Error('Error when invalidate token:', error);
  }
}

async function update (tokenId, tokenData) {
  try {
    if (!tokenId || !tokenData) {
      throw new Error('Invalid input: tokenId and tokenData are required');
    }

    const result = await Token.findByIdAndUpdate(tokenId, tokenData);
    if (!result) {
      logger.error('Token not found or no changes made');
    }

    return result;
  } catch (error) {
    throw new Error('Error updating token' + error);
  }
}

module.exports = {
  getToken,
  getById,
  getAvalibleToken,
  create: createToken,
  invalidateToken,
  update
};
