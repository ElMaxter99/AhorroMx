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
  return await jwt.verify(token, config.JWT_PUBLIC_KEY, {
    algorithms: [config.JWT_ALGORITHM]
  });
}
exports.verify = verify;

async function decode (token) {
  try {
    const decoded = await jwt.verify(token, config.JWT_PUBLIC_KEY, {
      algorithms: [config.JWT_ALGORITHM]
    });
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

async function getAvalibleToken (user) {
  if (!user) {
    throw new Error('getAvalibleToken: User no proporcionados');
  }

  const tokenFromDb = tokenRepository.getAvalibleToken(user._id);
  return tokenFromDb;
}
exports.getAvalibleToken = getAvalibleToken;

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

  const createdToken = await tokenRepository.invalidateToken(token);
  return createdToken;
}
exports.invalidateToken = invalidateToken;

async function generateTokenPair (user) {
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
