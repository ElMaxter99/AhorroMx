const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// 📌 Registro de usuario
router.post(
  '/register',
  [
    check('name').notEmpty().withMessage('El nombre es obligatorio.'),
    check('email').isEmail().withMessage('El email no es válido.'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres.')
  ],
  authController.register
);

// 📌 Inicio de sesión
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('El email no es válido.'),
    check('password').notEmpty().withMessage('La contraseña es obligatoria.')
  ],
  authController.login
);

// 📌 Cierre de sesión (El frontend eliminará el token)
router.post('/logout', authMiddleware, authController.logout);

// 📌 Renovación de token
router.post('/refresh-token', authController.refreshToken);

// 📌 Recuperación de contraseña (envío de email)
router.post(
  '/forgot-password',
  [check('email').isEmail().withMessage('El email no es válido.')],
  authController.forgotPassword
);

// 📌 Resetear contraseña (desde el link del email)
router.post(
  '/reset-password',
  [
    check('token').notEmpty().withMessage('El token es obligatorio.'),
    check('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres.')
  ],
  authController.resetPassword
);

module.exports = router;
