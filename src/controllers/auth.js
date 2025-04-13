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
    const token = req.token;
    await authBll.invalidateToken(token, req.user);
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  } catch (err) {
    logger.error('Logout error:', err);
    handleError(res, 500, err.message);
  }
};
