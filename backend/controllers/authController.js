    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const authModel = require("../models/authModel");

    // ===== ĐĂNG KÝ =====
    const register = async (req, res) => {
        try {
            const { hoTen, email, soDienThoai, password } = req.body;

            if (!hoTen || !email || !soDienThoai || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
            }

            const existingUser = await authModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email đã được sử dụng" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Dùng email làm tên đăng nhập cho đơn giản
            const maTK = await authModel.createTaiKhoan(email, hashedPassword, email, soDienThoai);
            await authModel.createKhachHang(maTK, hoTen);

            res.status(201).json({ message: "Đăng ký thành công" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    };

    // ===== ĐĂNG NHẬP =====
    const login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
            }

            const user = await authModel.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
            }

            const isMatch = await bcrypt.compare(password, user.MatKhau);
            if (!isMatch) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
            }

            const token = jwt.sign(
                { maTK: user.MaTK, email: user.Email, vaiTro: user.VaiTro },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(200).json({
                message: "Đăng nhập thành công",
                token,
                user: {
                    maTK: user.MaTK,
                    email: user.Email,
                    vaiTro: user.VaiTro.trim(),
                },
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    };

    // ===== TẠO TÀI KHOẢN ADMIN (chỉ Admin hiện tại mới gọi được) =====
    const registerAdmin = async (req, res) => {
        try {
            const { tenDangNhap, email, soDienThoai, password } = req.body;

            if (!tenDangNhap || !email || !soDienThoai || !password) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
            }

            const existingUser = await authModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email đã được sử dụng" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const maTK = await authModel.createAdmin(tenDangNhap, hashedPassword, email, soDienThoai);

            res.status(201).json({ message: "Tạo tài khoản Admin thành công", maTK });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    };

    module.exports = {
        register,
        login,
        registerAdmin, // thêm dòng này
    };

    // ===== ĐỔI MẬT KHẨU =====
    const changePassword = async (req, res) => {
        try {
            // Lấy maTK từ req.user (được giải mã bởi middleware verifyToken)
            const maTK = req.user.maTK; 
            const { matKhauCu, matKhauMoi } = req.body;

            if (!matKhauCu || !matKhauMoi) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
            }

            // 1. Tìm user
            const user = await authModel.findById(maTK);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            // 2. So sánh mật khẩu cũ
            const isMatch = await bcrypt.compare(matKhauCu, user.MatKhau);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
            }

            // 3. Mã hóa mật khẩu mới và cập nhật
            const hashedNewPassword = await bcrypt.hash(matKhauMoi, 10);
            await authModel.updatePassword(maTK, hashedNewPassword);

            res.status(200).json({ message: "Đổi mật khẩu thành công" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi máy chủ" });
        }
    };

    // ===== XÁC THỰC MẬT KHẨU (dùng khi đổi email, thao tác nhạy cảm...) =====
    const verifyPassword = async (req, res) => {
        try {
            const maTK = req.user.maTK; // lấy từ token, nhờ middleware verifyToken
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ message: "Vui lòng nhập mật khẩu" });
            }

            const user = await authModel.findById(maTK);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            const isMatch = await bcrypt.compare(password, user.MatKhau);
            if (!isMatch) {
                return res.status(400).json({ valid: false, message: "Mật khẩu không chính xác" });
            }

            res.status(200).json({ valid: true, message: "Xác thực thành công" });
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
        verifyPassword   // <-- dòng mới thêm
    };
