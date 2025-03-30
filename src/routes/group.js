const express = require('express');
const groupController = require('../controllers/group');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, groupController.create);

router.get('/:groupId', authMiddleware, groupController.geById);

router.get('/', authMiddleware, groupController.getList);

router.delete('/:groupId', authMiddleware, groupController.delete);

router.put('/:groupId', authMiddleware, groupController.update);

router.put('/add-member/:newMemberId', authMiddleware, groupController.addMember);
router.put('/remove-member/:memberId', authMiddleware, groupController.removeMember);
router.put('/add-admin/:newAdminId', authMiddleware, groupController.addAdmin);
router.put('/remove-admin/:adminId', authMiddleware, groupController.removeAdmin);
router.put('/transfer-owner/:newOwnerId', authMiddleware, groupController.transferGroupOwnership);

// Estos van para el groupInvitation
// router.post('/:groupId/join', authMiddleware, checkRole(ROLES.ADMIN), groupController.joinGroup); // Admin ruta para agregar usuarios a un grupo sin pasar por una invitación
// router.post('/:groupId/leave', authMiddleware, groupController.leaveGroup);
// router.post('/:groupId/make-admin/:userId', authMiddleware, groupController.setAdmin);
// router.post('/:groupId/remove-admin/:userId', authMiddleware, groupController.removeAdmin);
// router.post('/:groupId/transfer-ownership/:userId', authMiddleware, groupController.transferGroupOwnership);

// router.get('/:groupId/simplified-debts', authMiddleware, groupController.getSimplifiedDebts);

module.exports = router;
