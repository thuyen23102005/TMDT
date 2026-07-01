const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

//GET
router.get('/', productController.getAllProducts);

router.get('/:id', productController.getProductById);

module.exports = router;