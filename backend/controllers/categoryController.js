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

module.exports = {
    getAllCategories
};