'use strict';
const jwt = require('jsonwebtoken');
const ms = require('ms');

const tokenRepository = require('../repository/token');

const userBll = require('./user');

const config = require('../../config');

async function verify (token) {
  return jwt.verify(token, config.JWT_PUBLIC_KEY, {
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

async function sign (payload) {
  return jwt.sign(payload, config.PRIVATE_KEY, {
    algorithm: config.JWT_ALGORITHM,
    expiresIn: config.JWT_EXPIRATION
  });
}
exports.sign = sign;

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
    throw new Error('No tienes permisos para optener el token');
  }

  return tokenFromDb;
}
exports.getToken = getToken;

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
