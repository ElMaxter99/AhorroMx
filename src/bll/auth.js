'use strict';

const tokenBll = require('../bll/token');
const userBll = require('../bll/user');

async function getAuthToken (user) {
  const existingTokenPair = await tokenBll.getAvalibleTokenPair(user);
  if (existingTokenPair) {
    return existingTokenPair;
  }

  const newTokenPair = await tokenBll.generateTokenPair(user);
  return newTokenPair;
}
exports.getAuthToken = getAuthToken;

async function invalidateToken (token, user) {
  return tokenBll.invalidateToken(token, user);
}
exports.invalidateToken = invalidateToken;

async function invalidateAccessToken (userId, user) {
  if (!userId || !user) {
    throw new Error('invalidateAccessToken required userId and User');
  }

  const isAdmin = userBll.hasAdminRole(user);
  const isSameUser = userBll.isSameUser(userId, user);

  if (!isAdmin && isSameUser) {
    throw new Error('Error invalidateAccessToken, permission error');
  }

  return await tokenBll.invalidateAccessToken(userId, user);
}
exports.invalidateAccessToken = invalidateAccessToken;

async function invalidateRefreshToken (userId, user) {
  if (!userId || !user) {
    throw new Error('invalidateRefreshToken required userId and User');
  }

  const isAdmin = userBll.hasAdminRole(user);
  const isSameUser = userBll.isSameUser(userId, user);

  if (!isAdmin && isSameUser) {
    throw new Error('Error invalidateRefreshToken, permission error');
  }

  return await tokenBll.invalidateRefreshToken(userId, user);
}
exports.invalidateRefreshToken = invalidateRefreshToken;

async function refreshAccessToken (refreshToken) {
  const decoded = await tokenBll.decode(refreshToken);

  const tokenInDb = await tokenBll.getToken(refreshToken);
  const isRefreshToken = await tokenBll.isRefreshToken(refreshToken);
  if (!tokenInDb || !isRefreshToken) {
    throw new Error('Refresh token inválido');
  }

  const user = await userBll.getById(decoded.userId);
  if (!user) throw new Error('Usuario no encontrado');

  // Invalida el refresh token usado
  await tokenBll.invalidateToken(refreshToken);

  return await tokenBll.generateTokenPair(user);
}
exports.refreshAccessToken = refreshAccessToken;
