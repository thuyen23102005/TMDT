const voucherModel = require("../models/voucherModel");
const notificationModel = require("../models/notificationModel");
const { connectDB, sql } = require("../config/db");

// Lấy danh sách (Admin)
const getAll = async (req, res) => {
    try {
        const vouchers = await voucherModel.getAllVoucher();
        res.status(200).json(vouchers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy danh sách (Khách hàng)
const getActive = async (req, res) => {
    try {
        const vouchers = await voucherModel.getActiveVouchers();
        res.status(200).json(vouchers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Thêm Voucher
const create = async (req, res) => {
    try{
        if(await voucherModel.checkCodeExists(req.body.Code)){
            return res.status(400).json({ message:"Mã giảm giá đã tồn tại." });
        }

        await voucherModel.createVoucher(req.body);

        // --- TẠO THÔNG BÁO CHO TẤT CẢ KHÁCH HÀNG ---
        try {
            const pool = await connectDB();
            
            const users = await pool.request().query(`
                SELECT MaTK FROM TaiKhoan WHERE VaiTro = N'Khách hàng'
            `);

            for (let user of users.recordset) {
                await notificationModel.createNotification(
                    user.MaTK,
                    'voucher',
                    'Tặng bạn mã giảm giá mới 🎟️',
                    `Hệ thống vừa thêm mã giảm giá ${req.body.Code}. Nhanh tay lưu lại vào ví và sử dụng nhé!`
                );
            }
        } catch (notifyErr) {
            console.error("Lỗi gửi thông báo voucher:", notifyErr);
        }
        // ------------------------------------------

        res.json({ message:"Thêm thành công" });
    }catch(err){
        console.log(err);
        res.status(500).json({ message:"Lỗi server" });
    }
};

// Sửa
const update = async (req, res) => {
     try{
        if(await voucherModel.checkCodeExists(req.body.Code,req.params.id)){
            return res.status(400).json({ message:"Mã giảm giá đã tồn tại." });
        }

        await voucherModel.updateVoucher(req.params.id, req.body);
        res.json({ message:"Cập nhật thành công" });
    }catch(err){
        console.log(err);
        res.status(500).json({ message:"Lỗi server" });
    }
};

// Xóa
const remove = async (req, res) => {
    try {
        await voucherModel.deleteVoucher(req.params.id);
        res.json({ message: "Xóa thành công" });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = {
    getAll,
    getActive,
    create,
    update,
    remove
};