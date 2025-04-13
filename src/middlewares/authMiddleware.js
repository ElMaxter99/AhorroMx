const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../../config');
const { handleError } = require('../utils/errorHandler');
const CustomError = require('../utils/CustomError'); // Asegúrate de importar esto

// 🔧 Función auxiliar para extraer y verificar el token
const extractAndVerifyToken = (req) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    throw new CustomError(401, 'Acceso denegado. Token no proporcionado.');
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) {
    throw new CustomError(401, 'Formato de token inválido.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.PUBLIC_KEY, {
      algorithms: [config.JWT_ALGORITHM]
    });
  } catch (err) {
    throw new CustomError(401, 'Token inválido o expirado.');
  }

  if (!decoded?.userId) {
    throw new CustomError(401, 'Token inválido.');
  }

  return decoded.userId;
};

// 🔐 Middleware completo de autenticación (token + usuario)
exports.authMiddleware = async (req, res, next) => {
  try {
    const userId = extractAndVerifyToken(req);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new CustomError(401, 'Usuario no encontrado.');
    }

    if (!user.active) {
      throw new CustomError(403, 'Cuenta desactivada. Contacta al soporte.');
    }

    req.user = user;
    next();
  } catch (err) {
    return handleError(res, err.status || 500, err.message || 'Error de autenticación.');
  }
};

// 🔐 Middleware solo para verificar el token
exports.verifyToken = async (req, res, next) => {
  try {
    const userId = extractAndVerifyToken(req);
    req.userId = userId;
    next();
  } catch (err) {
    return handleError(res, err.status || 500, err.message || 'Error de autenticación.');
  }
};

// 👤 Middleware para cargar el usuario desde req.userId
exports.loadUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      throw new CustomError(401, 'Usuario no encontrado.');
    }

    if (!user.active) {
      throw new CustomError(403, 'Cuenta desactivada. Contacta al soporte.');
    }

    req.user = user;
    next();
  } catch (err) {
    return handleError(res, err.status || 500, err.message || 'Error al cargar el usuario.');
  }
};

// 🔒 Middleware para verificar roles
exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return handleError(res, 403, 'Acceso denegado.');
  }
  next();
};
