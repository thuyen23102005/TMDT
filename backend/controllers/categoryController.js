const categoryModel = require("../models/categoryModel");

// GET tất cả danh mục
const getAllCategories = async (req, res) => {

    try {

        const categories = await categoryModel.getAllCategories();

        res.status(200).json(categories);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi máy chủ"
        });

    }

};

// POST
const createCategory = async (req, res) => {

    try {

        await categoryModel.createCategory(req.body);

        res.status(201).json({
            message: "Thêm danh mục thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

};

// PUT
const updateCategory = async (req, res) => {

    try {

        await categoryModel.updateCategory(
            req.params.id,
            req.body
        );

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
// DELETE
const deleteCategory = async (req, res) => {

    try {

        await categoryModel.deleteCategory(req.params.id);

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
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};