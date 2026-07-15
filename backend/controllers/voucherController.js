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
    try{

        if(await voucherModel.checkCodeExists(req.body.Code)){

            return res.status(400).json({
                message:"Mã giảm giá đã tồn tại."
            });

        }

        await voucherModel.createVoucher(req.body);

        res.json({
            message:"Thêm thành công"
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            message:"Lỗi server"
        });

    }

};

// Sửa
const update = async (req, res) => {

     try{

        if(await voucherModel.checkCodeExists(req.body.Code,req.params.id)){

            return res.status(400).json({
                message:"Mã giảm giá đã tồn tại."
            });

        }

        await voucherModel.updateVoucher(
            req.params.id,
            req.body
        );

        res.json({
            message:"Cập nhật thành công"
        });

    }catch(err){

        console.log(err);

        res.status(500).json({
            message:"Lỗi server"
        });

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