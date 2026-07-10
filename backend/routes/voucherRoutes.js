const express = require("express");

const router = express.Router();

const voucherController = require("../controllers/voucherController");

router.get("/", voucherController.getAll);

router.post("/", voucherController.create);

router.put("/:id", voucherController.update);

router.delete("/:id", voucherController.remove);

module.exports = router;