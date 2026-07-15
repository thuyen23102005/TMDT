const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");


// ===== ĐĂNG KÝ =====
const register = async (req, res) => {
    // code đăng ký của bạn
};


// ===== ĐĂNG NHẬP =====
const login = async (req, res) => {
    // code login của bạn
};


// ===== TẠO ADMIN =====
const registerAdmin = async (req, res) => {
    // code admin của bạn
};


// ===== ĐỔI MẬT KHẨU =====
const changePassword = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        const { matKhauCu, matKhauMoi } = req.body;

        if (!matKhauCu || !matKhauMoi) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới"
            });
        }

        const user = await authModel.findById(maTK);

        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }


        const isMatch = await bcrypt.compare(
            matKhauCu,
            user.MatKhau
        );


        if (!isMatch) {
            return res.status(400).json({
                message: "Mật khẩu cũ không đúng"
            });
        }


        const hashedNewPassword = await bcrypt.hash(
            matKhauMoi,
            10
        );


        await authModel.updatePassword(
            maTK,
            hashedNewPassword
        );


        res.status(200).json({
            message: "Đổi mật khẩu thành công"
        });


    } catch(error) {
        console.error(error);
        res.status(500).json({
            message:"Lỗi máy chủ"
        });
    }
};



// ===== XÁC THỰC MẬT KHẨU =====
const verifyPassword = async (req,res)=>{
    try{

        const maTK = req.user.maTK;
        const {password}=req.body;


        const user = await authModel.findById(maTK);

        if(!user){
            return res.status(404).json({
                message:"Không tìm thấy người dùng"
            });
        }


        const isMatch = await bcrypt.compare(
            password,
            user.MatKhau
        );


        if(!isMatch){
            return res.status(400).json({
                valid:false,
                message:"Mật khẩu không chính xác"
            });
        }


        res.json({
            valid:true,
            message:"Xác thực thành công"
        });


    }catch(error){
        console.error(error);
        res.status(500).json({
            message:"Lỗi máy chủ"
        });
    }
};



// CHỈ EXPORT Ở CUỐI FILE
module.exports = {
    register,
    login,
    registerAdmin,
    changePassword,
    verifyPassword
};