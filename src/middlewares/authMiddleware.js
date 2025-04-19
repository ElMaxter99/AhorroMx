const userBll = require('../bll/user');
const tokenBll = require('../bll/token');

const userRepository = require('../repository/user');

const { handleError } = require('../utils/errorHandler');
const CustomError = require('../utils/CustomError');

// 🔧 Función auxiliar para extraer y verificar el token
async function extractAndVerifyToken (req) {
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
    decoded = await tokenBll.verify(token);
    if (!decoded.valid) {
      throw new CustomError(401, 'Token inválido o expirado.');
    }
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
    const userId = await extractAndVerifyToken(req);
    const user = await userRepository.getById(userId);
    if (!user || user.deleted) {
      throw new CustomError(401, 'Usuario no encontrado.');
    }

    if (!user.active || user.blocked) {
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
    const userId = await extractAndVerifyToken(req);
    req.userId = userId;
    next();
  } catch (err) {
    return handleError(res, err.status || 500, err.message || 'Error de autenticación.');
  }
};

// 👤 Middleware para cargar el usuario desde req.userId
exports.loadUser = async (req, res, next) => {
  try {
    const user = await userBll.getById(req.userId);
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
