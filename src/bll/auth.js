'use strict';

const tokenBll = require('../bll/token');
const userBll = require('../bll/user');

async function getAuthToken (user) {
  const avalibleAuthToken = await tokenBll.getAvalibleToken(user);
  if (avalibleAuthToken) { return avalibleAuthToken; }

  const newAuthToken = await tokenBll.generateTokenPair(user);
  return newAuthToken;
};
exports.getAuthToken = getAuthToken;

async function invalidateToken (token, user) {
  return tokenBll.invalidateToken(token, user);
}
exports.invalidateToken = invalidateToken;

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
