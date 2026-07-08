const voucherModel = require("../models/voucherModel");

// Lấy danh sách
const getAll = async (req, res) => {

    try {

        const vouchers = await voucherModel.getAllVoucher();

        res.status(200).json(vouchers);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

// Thêm
const create = async (req, res) => {

    try {

        await voucherModel.createVoucher(req.body);

        res.status(201).json({
            message: "Thêm mã giảm giá thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

};

// Sửa
const update = async (req, res) => {

    try {

        await voucherModel.updateVoucher(

            req.params.id,

            req.body

        );

        res.json({
            message: "Cập nhật thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

};

// Xóa
const remove = async (req, res) => {

    try {

        await voucherModel.deleteVoucher(req.params.id);

        res.json({
            message: "Xóa thành công"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

};

module.exports = {

    getAll,
    create,
    update,
    remove

};