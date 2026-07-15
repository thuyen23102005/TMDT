const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/changePassword
router.put("/change-password", verifyToken, authController.changePassword);

module.exports = router;