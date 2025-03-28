const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./user');
const groupRoutes = require('./group');
const groupInvitationRoutes = require('./groupInvitation');
const expenseRoutes = require('./expense');
const contributionRoutes = require('./contribution');
const movementRoutes = require('./movement');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/movements', movementRoutes);
router.use('/groups', groupRoutes);
router.use('/group-invitations', groupInvitationRoutes);

router.use('/expenses', expenseRoutes);
router.use('/contributions', contributionRoutes);

module.exports = router;
