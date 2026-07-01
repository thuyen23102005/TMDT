const productModel = require("../models/productModel");

const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi server"
        });
    }
};

module.exports = {
    getAllProducts
};