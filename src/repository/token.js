'use strict';

const Token = require('../models/token');

const logger = require('../utils/logger');

const TOKEN_TYPES = require('../enums/token').TYPES;

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

async function getAvalibleAccessToken (userId) {
  try {
    if (!userId) {
      throw new Error('Invalid input userId is required !');
    }

    const result = await Token.findOne({
      user: userId,
      type: TOKEN_TYPES.ACCESS_TOKEN,
      expiresAt: { $gt: new Date() },
      valid: true
    });

    return result;
  } catch (error) {
    throw new Error('Error getting avalible token: ', error);
  }
}

async function getAvalibleRefreshToken (userId) {
  try {
    if (!userId) {
      throw new Error('Invalid input userId is required !');
    }

    const result = await Token.findOne({
      user: userId,
      type: TOKEN_TYPES.REFRESH_TOKEN,
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

/**
 * Invalida un token de usuario según el tipo.
 * @param {String} userId - ID del usuario.
 * @param {String} tokenType - Tipo de token a invalidar (e.g., ACCESS_TOKEN, REFRESH_TOKEN).
 * @returns {Promise<Object|null>}
 */
async function invalidateTokenByType (userId, tokenType) {
  if (!userId || !tokenType) {
    throw new Error('User ID and token type are required');
  }

  try {
    return await Token.findOneAndUpdate(
      { user: userId, type: tokenType, valid: true },
      { valid: false },
      { new: true }
    );
  } catch (err) {
    console.error(`Error invalidating ${tokenType} for user ${userId}:`, err);
    throw new Error(`Could not invalidate ${tokenType}`);
  }
}

// Uso específico
async function invalidateAccessToken (userId) {
  return invalidateTokenByType(userId, TOKEN_TYPES.ACCESS_TOKEN);
}

async function invalidateRefreshToken (userId) {
  return invalidateTokenByType(userId, TOKEN_TYPES.REFRESH_TOKEN);
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
  getAvalibleAccessToken,
  getAvalibleRefreshToken,
  create: createToken,
  invalidateToken,
  invalidateRefreshToken,
  invalidateAccessToken,
  update
};
