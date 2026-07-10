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

const createProduct = async (req, res) => {

    try {

        const product = {
            ...req.body,
            HinhAnh: req.file ? req.file.filename : null
        };

        await productModel.createProduct(product);

        res.json({
            message: "Thêm sản phẩm thành công"
        });

    } catch (err) {

        console.log(err);
        res.status(500).json(err);

    }

};

const updateProduct = async (req, res) => {

    try {

        const id = req.params.id;

        const product = {
            ...req.body,
            HinhAnh: req.file
                ? req.file.filename
                : req.body.HinhAnh
        };

        await productModel.updateProduct(id, product);

        res.json({
            message: "Cập nhật thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

};

const deleteProduct = async (req, res) => {

    try {

        await productModel.deleteProduct(req.params.id);

        res.json({
            message: "Xóa thành công"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json(err);

    }

};
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};