const express = require("express");
const movementController = require("../controllers/movementController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, movementController.createMovement);
router.get("/", authMiddleware, movementController.getMovements);
router.get("/:movementId", authMiddleware, movementController.getMovementById);
router.delete("/:movementId", authMiddleware, movementController.deleteMovement);

module.exports = router;
