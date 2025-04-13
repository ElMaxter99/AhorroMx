'use strict';
const tokenBll = require('../bll/token');

async function createAuthToken (user) {
  const payload = { userId: user._id };
  const token = await tokenBll.sign(payload);
  const decoded = await tokenBll.decode(token);
  const tokenData = {
    token,
    user: user._id,
    expiresAt: new Date(decoded.exp * 1000)
  };

  return await tokenBll.create(tokenData, user);
};
exports.createAuthToken = createAuthToken;

async function getAuthToken (user) {
  const avalibleAuthToken = await tokenBll.getAvalibleToken(user);
  if (avalibleAuthToken) { return avalibleAuthToken; }

  const newAuthToken = await createAuthToken(user);
  return newAuthToken;
};
exports.getAuthToken = getAuthToken;

async function invalidateToken (token, user) {
  return tokenBll.invalidateToken(token, user);
}
exports.invalidateToken = invalidateToken;
