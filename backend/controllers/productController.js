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

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.getById(id); 
        if (!product) return res.status(404).json({ message: "Không tìm thấy" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { getAllProducts, getProductById };