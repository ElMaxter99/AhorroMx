const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshAccessToken);
// router.post('/register', authController.register);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

module.exports = router;
