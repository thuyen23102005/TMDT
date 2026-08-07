const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

// GET /api/recommendations/repurchase/:maTK -> nhắc mua lại
// (phải khai báo TRƯỚC route "/:maTK" bên dưới, nếu không "repurchase" sẽ bị hiểu nhầm là maTK)
router.get("/repurchase/:maTK", recommendationController.getRepurchaseReminders);

// GET /api/recommendations/:maTK -> gợi ý sản phẩm cá nhân hóa
router.get("/:maTK", recommendationController.getPersonalizedRecommendations);

module.exports = router;