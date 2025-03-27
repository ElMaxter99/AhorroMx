const express = require('express');
const groupController = require('../controllers/groupController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

const { ROLES } = require('../enums/user');

const router = express.Router();

router.post('/', authMiddleware, groupController.createGroup);
router.get('/', authMiddleware, groupController.getGroups);
router.get('/:groupId', authMiddleware, groupController.getGroupById);
router.put('/:groupId', authMiddleware, groupController.updateGroup);
router.delete('/:groupId', authMiddleware, groupController.deleteGroup);

router.post('/:groupId/join', authMiddleware, checkRole(ROLES.ADMIN), groupController.joinGroup); // Admin ruta para agregar usuarios a un grupo sin pasar por una invitación
router.post('/:groupId/leave', authMiddleware, groupController.leaveGroup);
router.post('/:groupId/make-admin/:userId', authMiddleware, groupController.setAdmin);
router.post('/:groupId/remove-admin/:userId', authMiddleware, groupController.removeAdmin);
router.post('/:groupId/transfer-ownership/:userId', authMiddleware, groupController.transferGroupOwnership);

router.get('/:groupId/simplified-debts', authMiddleware, groupController.getSimplifiedDebts);

module.exports = router;
