'use strict';

const authBll = require('../bll/auth');
const userBll = require('../bll/user');

const { logger } = require('../utils/logger');
const { handleError } = require('../utils/errorHandler');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFromDb = await userBll.getByEmail(email);
    if (!userFromDb || !(await userBll.comparePassword(userFromDb, password))) {
      return handleError(res, 401, 'Credenciales inválidas.');
    }

    const token = await authBll.getAuthToken(userFromDb);
    res.status(200).json({ token });
  } catch (err) {
    logger.error('Login error:', err);
    handleError(res, 500, err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.user;
    await authBll.invalidateToken(refreshToken, req.user);
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  } catch (err) {
    logger.error('Logout error:', err);
    handleError(res, 500, err.message);
  }
};

exports.refreshAccessToken = async function refreshAccessToken (req, res) {
  try {
    if (!req.body.refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' });
    }

    const { accessToken, refreshToken } = await authBll.refreshAccessToken(req.body.refreshToken);
    res.status(200).json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token inválido o expirado' });
  }
};
