'use strict';
const jwt = require('jsonwebtoken');
const ms = require('ms');

const tokenRepository = require('../repository/token');

const userBll = require('./user');

const config = require('../../config');

const TOKEN_TYPES = require('../enums/token').TYPES;

async function isRefreshToken (token) {
  token = token._id ? await getById(token) : token;
  return token.type === TOKEN_TYPES.REFRESH_TOKEN;
}
exports.isRefreshToken = isRefreshToken;

async function isAccessToken (token) {
  token = token._id ? await getById(token) : token;
  return token.type === TOKEN_TYPES.ACCESS_TOKEN;
}
exports.isAccessToken = isAccessToken;

async function verify (token) {
  try {
    return await jwt.verify(token, config.JWT_PUBLIC_KEY, {
      algorithms: [config.JWT_ALGORITHM]
    });
  } catch (err) {
    return false;
  }
}
exports.verify = verify;

async function decode (token) {
  try {
    const decoded = await verify(token);
    return decoded;
  } catch (err) {
    throw new Error('Token inválido o expirado');
  }
}
exports.decode = decode;

async function sign (payload, options = {}) {
  return await jwt.sign(payload, config.JWT_PRIVATE_KEY, {
    algorithm: config.JWT_ALGORITHM,
    expiresIn: options.jwtExpiration || config.JWT_EXPIRATION
  });
}
exports.sign = sign;

async function getById (tokenId, user) {
  if (!tokenId || !user) {
    throw new Error('tokenID and user required');
  }

  const tokenFromDb = tokenRepository.getById(tokenId);
  if (!tokenFromDb) { return tokenFromDb; };

  const isSameUser = userBll.isSameUser(tokenFromDb.user, user);
  const isAdmin = userBll.hasAdminRole(user);

  if (!isAdmin && !isSameUser) {
    throw new Error('No tienes permisos para obtener el token');
  }

  return tokenFromDb;
}
exports.getById = getById;

async function getToken (token, user) {
  if (!token || !user) {
    throw new Error('Datos del token o usuario no proporcionados');
  }

  const tokenFromDb = tokenRepository.getToken(token);
  if (!tokenFromDb) {
    return tokenFromDb;
  }

  const isSameUser = userBll.isSameUser(tokenFromDb.user, user);
  const isAdmin = userBll.hasAdminRole(user);

  if (!isAdmin && !isSameUser) {
    throw new Error('No tienes permisos para obtener el token');
  }

  return tokenFromDb;
}
exports.getToken = getToken;

async function getAvalibleTokenPair (user) {
  if (!user) {
    throw new Error('getAvalibleTokenPair: User no proporcionados');
  }

  const accessToken = await tokenRepository.getAvalibleAccessToken(user._id);
  const refreshToken = await tokenRepository.getAvalibleRefreshToken(user._id);

  if (!accessToken || !refreshToken) { return null; }

  return {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshTokenExpiresAt: refreshToken.expiresAt
  };
}
exports.getAvalibleTokenPair = getAvalibleTokenPair;

async function createToken (data, user) {
  if (!data || !user) {
    throw new Error('Datos del token o usuario no proporcionado');
  }

  const isAdmin = userBll.hasAdminRole(user);
  if (!isAdmin) {
    data.user = user._id;
  }

  const expirationTime = ms(config.JWT_EXPIRATION);
  data.expiresAt = new Date(Date.now() + expirationTime);

  const createdToken = await tokenRepository.create(data);
  return createdToken;
}
exports.create = createToken;

async function invalidateToken (token, user) {
  if (!token || !user) {
    throw new Error('Datos del token o usuario no proporcionado');
  }

  const tokenFromDb = getToken(token, user);
  if (!tokenFromDb) {
    throw new Error('Error al invalidar el token');
  }

  const expirationTime = ms(config.JWT_EXPIRATION);
  token.expiresAt = new Date(Date.now() + expirationTime);

  const invalidatedToken = await tokenRepository.invalidateToken(token);
  return invalidatedToken;
}
exports.invalidateToken = invalidateToken;

async function invalidateAccessToken (userId, user) {
  if (!userId || !user) {
    throw new Error('Datos del userId o usuario no proporcionado');
  }

  const invalidToken = await tokenRepository.invalidateAccessToken(userId);
  return invalidToken;
}
exports.invalidateAccessToken = invalidateAccessToken;

async function invalidateRefreshToken (userId, user) {
  if (!userId || !user) {
    throw new Error('Datos del userId o usuario no proporcionado');
  }

  const invalidToken = await tokenRepository.invalidateRefreshToken(userId);
  return invalidToken;
}
exports.invalidateRefreshToken = invalidateRefreshToken;

async function generateTokenPair (user) {
  // Invalidar el resto de tokens antes de generar nuevos
  await tokenRepository.invalidateAccessToken(user._id);
  await tokenRepository.invalidateRefreshToken(user._id);

  const payload = { userId: user._id };

  const accessToken = await sign(payload);
  const refreshToken = await sign(payload, { jwtExpiration: config.JWT_REFRESH_EXPIRATION });

  const accessDecoded = await decode(accessToken);
  const refreshDecoded = await decode(refreshToken);

  const accessTokenData = {
    token: accessToken,
    valid: true,
    user: user._id,
    expiresAt: new Date(accessDecoded.exp * 1000),
    type: TOKEN_TYPES.ACCESS_TOKEN
  };
  await tokenRepository.create(accessTokenData);

  const refreshTokenData = {
    token: refreshToken,
    valid: true,
    user: user._id,
    expiresAt: new Date(refreshDecoded.exp * 1000),
    type: TOKEN_TYPES.REFRESH_TOKEN
  };
  await tokenRepository.create(refreshTokenData);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessTokenData.expiresAt,
    refreshTokenExpiresAt: refreshTokenData.expiresAt
  };
}
exports.generateTokenPair = generateTokenPair;
