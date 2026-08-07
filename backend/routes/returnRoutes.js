const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const returnController = require("../controllers/returnController");

// Lưu ảnh minh chứng đổi trả vào cùng thư mục uploads/ đang dùng cho ảnh sản phẩm
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "doitra-" + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Khách hàng gửi yêu cầu đổi/trả (multipart vì có ảnh)
router.post("/", upload.any(), returnController.createReturnRequest);

// Khách hàng xem danh sách yêu cầu đổi/trả của mình
router.get("/user/:maTK", returnController.getReturnRequestsByUser);

// Admin xem tất cả yêu cầu
router.get("/", returnController.getAllReturnRequests);

// Admin xem chi tiết 1 yêu cầu (kèm ảnh)
router.get("/:id", returnController.getReturnRequestDetail);

// Admin duyệt / từ chối / hoàn thành
router.put("/:id/status", returnController.updateReturnStatus);

module.exports = router;