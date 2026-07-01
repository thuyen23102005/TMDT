const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET
router.get('/:maKH', cartController.getCartByCustomerId);

router.post('/checkout', cartController.checkoutCart);

module.exports = router;