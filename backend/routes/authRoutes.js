const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
<<<<<<< Updated upstream
=======
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
>>>>>>> Stashed changes

console.log(authController);

console.log(typeof authController.register);
console.log(typeof authController.login);
console.log(typeof authController.registerAdmin);   
console.log(typeof authController.verifyPassword);

console.log(typeof verifyToken);
console.log(typeof isAdmin);

router.put("/change-password", (req,res,next)=>{
    console.log("Route change-password hit");
    next();
}, verifyToken, authController.changePassword);
// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

<<<<<<< Updated upstream
=======
// POST /api/auth/register-admin (chỉ Admin đang đăng nhập mới gọi được)
router.post("/register-admin", verifyToken, isAdmin, authController.registerAdmin);

// POST /api/auth/verify-password (xác thực mật khẩu trước thao tác nhạy cảm)
router.post("/verify-password", verifyToken, authController.verifyPassword);

>>>>>>> Stashed changes
module.exports = router;