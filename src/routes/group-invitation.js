const express = require('express');
const groupInvitationController = require('../controllers/group-invitation');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, groupInvitationController.create);

router.get('/:groupInvitationId', authMiddleware, groupInvitationController.getById);
router.get('/group/:groupId', authMiddleware, groupInvitationController.getByGroupId);
router.get('/invited-user/:invitedUserId', authMiddleware, groupInvitationController.getByInvitedUserId);
router.get('/inviter/:inviterId', authMiddleware, groupInvitationController.getByInviterId);
router.get('/status/:status', authMiddleware, groupInvitationController.getByStatus);

router.get('/', authMiddleware, groupInvitationController.getList);

router.delete('/:groupInvitationId', authMiddleware, groupInvitationController.delete);

router.put('/:groupInvitationId', authMiddleware, groupInvitationController.update);

router.post('/handle-invitation/:groupInvitationId/:status', authMiddleware, groupInvitationController.handleInvitation);
router.put('/handle-invitation-action/:groupInvitationId/:invitationAction', authMiddleware, groupInvitationController.handleInvitationAction);

module.exports = router;
