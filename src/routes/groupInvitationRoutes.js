const express = require('express');
const router = express.Router();
const groupInvitationController = require('../controllers/groupInvitationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/:groupId/invite', authMiddleware, groupInvitationController.inviteUser);
router.put('/invitation/:invitationId', authMiddleware, groupInvitationController.respondToInvitation);
router.get('/invitations', authMiddleware, groupInvitationController.getUserInvitations);

module.exports = router;
