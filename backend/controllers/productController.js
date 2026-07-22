const productModel = require("../models/productModel");

// Validate dữ liệu sản phẩm
const validateProduct = (product) => {

    const {
        TenSP,
        MaDM,
        DonGia,
        SoLuongTon,
        DonViTinh,
        MoTa
    } = product;

    if (!TenSP || !TenSP.trim())
        return "Tên sản phẩm không được để trống.";

    if (TenSP.trim().length < 2)
        return "Tên sản phẩm phải có ít nhất 2 ký tự.";

    if (TenSP.trim().length > 100)
        return "Tên sản phẩm tối đa 100 ký tự.";

    if (!MaDM)
        return "Vui lòng chọn danh mục.";

    if (!DonGia || Number(DonGia) <= 0)
        return "Giá phải lớn hơn 0.";

    if (!Number.isInteger(Number(SoLuongTon)))
        return "Số lượng tồn phải là số nguyên.";

    if (Number(SoLuongTon) < 0)
        return "Số lượng tồn không được âm.";

    if (!DonViTinh || !DonViTinh.trim())
        return "Đơn vị tính không được để trống.";

    if (DonViTinh.trim().length > 30)
        return "Đơn vị tính tối đa 30 ký tự.";

    if (!MoTa || !MoTa.trim())
        return "Mô tả không được để trống.";

    if (MoTa.trim().length > 1000)
        return "Mô tả tối đa 1000 ký tự.";

    return null;
};

// ==================== CLIENT ====================

const getAllProductsClient = async (req, res) => {

    try {

        const products = await productModel.getAllProductsClient();

        res.json(products);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

// ==================== ADMIN ====================

const getAllProducts = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const data = await productModel.getAllProducts(page, limit);

        res.json(data);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

const getProductById = async (req, res) => {

    try {

        const product = await productModel.getById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json(product);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

// ==================== CREATE ====================

const createProduct = async (req, res) => {

    try {

        const product = {
            ...req.body,
            HinhAnh: req.file ? req.file.filename : null
        };

        // Validate dữ liệu
        const error = validateProduct(product);

        if (error) {
            return res.status(400).json({
                message: error
            });
        }

        // Kiểm tra ảnh
        if (!req.file) {
            return res.status(400).json({
                message: "Vui lòng chọn hình ảnh."
            });
        }

        // Kiểm tra danh mục
        const categoryExists =
            await productModel.checkCategoryExists(product.MaDM);

        if (!categoryExists) {
            return res.status(400).json({
                message: "Danh mục không tồn tại."
            });
        }

        // Kiểm tra trùng tên
        const exists =
            await productModel.checkProductName(product.TenSP.trim());

        if (exists) {
            return res.status(400).json({
                message: "Tên sản phẩm đã tồn tại."
            });
        }

        await productModel.createProduct(product);

        res.status(201).json({
            message: "Thêm sản phẩm thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

// ==================== UPDATE ====================

const updateProduct = async (req, res) => {

    try {

        const id = req.params.id;

        const product = {
            ...req.body,
            HinhAnh: req.file
                ? req.file.filename
                : req.body.HinhAnh
        };

        // Validate
        const error = validateProduct(product);

        if (error) {
            return res.status(400).json({
                message: error
            });
        }

        // Kiểm tra danh mục
        const categoryExists =
            await productModel.checkCategoryExists(product.MaDM);

        if (!categoryExists) {
            return res.status(400).json({
                message: "Danh mục không tồn tại."
            });
        }

        // Kiểm tra trùng tên
        const exists =
            await productModel.checkProductNameUpdate(
                id,
                product.TenSP.trim()
            );

        if (exists) {
            return res.status(400).json({
                message: "Tên sản phẩm đã tồn tại."
            });
        }

        await productModel.updateProduct(id, product);

        res.json({
            message: "Cập nhật thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

// ==================== DELETE ====================

const deleteProduct = async (req, res) => {

    try {

        await productModel.deleteProduct(req.params.id);

        res.json({
            message: "Xóa thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

module.exports = {
    getAllProducts,
    getAllProductsClient,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};