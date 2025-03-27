const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../../config');

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({ error: 'Formato de token inválido.' });
    }

    const decoded = jwt.verify(token, config.PUBLIC_KEY, { algorithms: [config.JWT_ALGORITHM] });
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al soporte.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// 📌 Middleware para verificar roles (Ejemplo: ADMIN, USER)
exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado.' });
  }
  next();
};
