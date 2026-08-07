const express = require("express");
const router = express.Router();

const chatbotController = require("../controllers/chatbotController");

router.post("/ask", chatbotController.ask);
router.post("/ask-image", chatbotController.uploadMiddleware.single("image"), chatbotController.askImage);

module.exports = router;