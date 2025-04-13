'use strict';
const tokenBll = require('../bll/token');

async function createAuthToken (user) {
  const payload = { userId: user._id };
  const token = tokenBll.sign(payload);
  const decoded = tokenBll.decode(token);
  const tokenData = {
    token,
    user: user._id,
    expiresAt: new Date(decoded.exp * 1000)

  };
  return await tokenBll.create(tokenData, user);
};
exports.createAuthToken = createAuthToken;

async function invalidateToken (token, user) {
  return tokenBll.invalidateToken(token, user);
}
exports.invalidateToken = invalidateToken;
