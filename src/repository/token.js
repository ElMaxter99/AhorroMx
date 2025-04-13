'use strict';

const Token = require('../models/token');

async function getToken (token) {
  try {
    if (!token) {
      throw new Error('Invalid input: token is required !');
    }

    const result = await Token.get({ token });
    return result;
  } catch (error) {
    throw new Error('Error getting token:', error.message);
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
    throw new Error('Error creating token:', error.message);
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
    throw new Error('Error when invalidate token:', error.message);
  }
}

module.exports = {
  getToken,
  create: createToken,
  invalidateToken
};
