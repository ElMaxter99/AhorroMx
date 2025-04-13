'use strict';
const express = require('express');

const userController = require('../controllers/user');

const { profileImageUpload } = require('../../config/multer');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, userController.create);
router.post('/register', userController.register);

router.get('/:userId', authMiddleware, userController.getById);
router.get('/profile/:userId', authMiddleware, userController.getProfile);

router.get('/', authMiddleware, userController.getList);

router.delete('/:userId', authMiddleware, userController.falseDelete);
router.delete('/true-delete/:userId', authMiddleware, userController.delete);

router.put('/:userId', authMiddleware, userController.update);
router.put('/active/:userId', authMiddleware, userController.activateUser);
router.put('/deactivate/:userId', authMiddleware, userController.deactivateUser);
router.put('/change-password/:userId', authMiddleware, userController.updatePassword);
router.put('/update-roles/:userId', authMiddleware, userController.updateRoles);
router.put('/add-role/:userId', authMiddleware, userController.addRole);
router.put('/remove-role/:userId', authMiddleware, userController.removeRole);

router.post('/upload-profile', authMiddleware, profileImageUpload.single('image'), userController.uploadProfileImage);

module.exports = router;
