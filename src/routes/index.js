const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./user');
const groupRoutes = require('./group');
const groupInvitationRoutes = require('./group-invitation');
const expenseRoutes = require('./expense');
const contributionRoutes = require('./contribution');
const movementRoutes = require('./movement');

const multiavatarRoutes = require('./multiavatar');

const router = express.Router();

// Main routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/movements', movementRoutes);
router.use('/groups', groupRoutes);
router.use('/group-invitations', groupInvitationRoutes);

router.use('/expenses', expenseRoutes);
router.use('/contributions', contributionRoutes);

// Extra routes
router.use('/multiavatar', multiavatarRoutes);

module.exports = router;
