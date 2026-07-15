const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");


// ===== ĐĂNG KÝ =====
const register = async (req, res) => {
    try {
        const { tenDangNhap, hoTen, email, matKhau, soDienThoai } = req.body;

        if (!email || !matKhau || !tenDangNhap) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const existingUser = await authModel.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                message: "Email đã được sử dụng"
            });
        }

        const hashedPassword = await bcrypt.hash(matKhau, 10);

        // Tạo tài khoản trước, lấy MaTK vừa tạo
        const maTK = await authModel.createTaiKhoan(
            tenDangNhap,
            hashedPassword,
            email,
            soDienThoai
        );

        // Tạo hồ sơ khách hàng liên kết với tài khoản
        await authModel.createKhachHang(maTK, hoTen);

        res.status(201).json({
            message: "Đăng ký thành công",
            maTK,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};


// ===== ĐĂNG NHẬP =====
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ email và mật khẩu"
            });
        }

        const user = await authModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "Email không tồn tại"
            });
        }

        const isMatch = await bcrypt.compare(password, user.MatKhau);

        if (!isMatch) {
            return res.status(400).json({
                message: "Mật khẩu không đúng"
            });
        }

        const token = jwt.sign(
            { maTK: user.MaTK, vaiTro: user.VaiTro },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                maTK: user.MaTK,
                email: user.Email,
                tenDangNhap: user.TenDangNhap,
                vaiTro: user.VaiTro,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};


// ===== TẠO ADMIN =====
const registerAdmin = async (req, res) => {
    try {
        const { tenDangNhap, email, matKhau, soDienThoai } = req.body;

        if (!email || !matKhau || !tenDangNhap) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        const existingUser = await authModel.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                message: "Email đã được sử dụng"
            });
        }

        const hashedPassword = await bcrypt.hash(matKhau, 10);

        const maTK = await authModel.createAdmin(
            tenDangNhap,
            hashedPassword,
            email,
            soDienThoai
        );

        res.status(201).json({
            message: "Tạo tài khoản Admin thành công",
            maTK,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
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

        const isMatch = await bcrypt.compare(matKhauCu, user.MatKhau);

        if (!isMatch) {
            return res.status(400).json({
                message: "Mật khẩu cũ không đúng"
            });
        }

        const hashedNewPassword = await bcrypt.hash(matKhauMoi, 10);

        await authModel.updatePassword(maTK, hashedNewPassword);

        res.status(200).json({
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};


// ===== XÁC THỰC MẬT KHẨU =====
const verifyPassword = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        const { password } = req.body;

        const user = await authModel.findById(maTK);

        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        const isMatch = await bcrypt.compare(password, user.MatKhau);

        if (!isMatch) {
            return res.status(400).json({
                valid: false,
                message: "Mật khẩu không chính xác"
            });
        }

        res.json({
            valid: true,
            message: "Xác thực thành công"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};


module.exports = {
    register,
    login,
    registerAdmin,
    changePassword,
    verifyPassword
};