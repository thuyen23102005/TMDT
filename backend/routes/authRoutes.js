const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.put("/change-password", verifyToken, authController.changePassword);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/register-admin", verifyToken, isAdmin, authController.registerAdmin);
router.post("/verify-password", verifyToken, authController.verifyPassword);

module.exports = router;