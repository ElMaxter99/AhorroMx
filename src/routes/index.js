const express = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const groupRoutes = require("./groupRoutes");
const groupInvitationRoutes = require("./groupInvitationRoutes");
const expenseRoutes = require("./expenseRoutes");
const contributionRoutes = require("./contributionRoutes");
const movementRoutes = require("./movementRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/movements", movementRoutes);
router.use("/groups", groupRoutes);
router.use("/group-invitations", groupInvitationRoutes);

router.use("/expenses", expenseRoutes);
router.use("/contributions", contributionRoutes);

module.exports = router;
