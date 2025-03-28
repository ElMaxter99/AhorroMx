const express = require('express');
const userController = require('../controllers/user');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);
router.put('/settings', authMiddleware, userController.updateSettings);
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;
