const express = require('express');
const userController = require('../controllers/user');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', userController.create);

router.get('/:userId', authMiddleware, userController.getById);
router.get('/profile-info/:userId', authMiddleware, userController.getProfile);

router.get('/', authMiddleware, userController.getList);

router.delete('/:userId', authMiddleware, userController.falseDelete);
router.delete('/true-delete/:userId', authMiddleware, userController.delete);

router.put('/:userId', authMiddleware, userController.update);
router.put('/profile-info/:userId', authMiddleware, userController.updateProfileInfo);
router.put('/active/:userId', authMiddleware, userController.activateUser);
router.put('/deactivate/:userId', authMiddleware, userController.deactivateUser);
router.put('/change-password/:userId', authMiddleware, userController.updatePassword);
router.put('/update-roles/:userId', authMiddleware, userController.updateRoles);
router.put('/add-role/:userId', authMiddleware, userController.addRole);
router.put('/remove-role/:userId', authMiddleware, userController.removeRole);
router.put('/update-profile-picture/:userId', authMiddleware, userController.updateProfilePicture);

module.exports = router;
