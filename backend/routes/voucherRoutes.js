const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { verifyToken } = require("../middlewares/authMiddleware");


router.get("/redeemable", verifyToken, voucherController.getRedeemable);
router.get("/my-vouchers", verifyToken, voucherController.getMyVouchers);
router.post("/claim-monthly", verifyToken, voucherController.claimMonthly);
router.get("/monthly-status", verifyToken, voucherController.checkMonthlyStatus);
router.get("/active", voucherController.getActive);
router.get("/", voucherController.getAll);
router.post("/", voucherController.create);

router.post("/:id/redeem", verifyToken, voucherController.redeem);
router.put("/:id", voucherController.update);
router.delete("/:id", voucherController.remove);

module.exports = router;