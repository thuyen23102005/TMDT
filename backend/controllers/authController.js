const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validate } = require("deep-email-validator");
const authModel = require("../models/authModel");
const notificationModel = require("../models/notificationModel");
const redisClient = require("../config/redis");
const { sendEmail } = require("../utils/emailService");

// Hàm sinh OTP 6 số
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ===== HÀM LOGIC PHỤ TRỢ MỞ RỘNG MÃ OTP =====
const verifyOTPLogic = async (email, inputOtp) => {
    if (!email || !inputOtp) return false;
    const redisKey = `otp:${email.trim().toLowerCase()}`;
    const savedOtp = await redisClient.get(redisKey);

    if (savedOtp && savedOtp === inputOtp.trim()) {
        await redisClient.del(redisKey); // Xóa OTP sau khi dùng thành công
        return true;
    }
    return false;
};

// ===== GỬI MÃ OTP XÁC THỰC EMAIL (DÙNG CHUNG) =====
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập địa chỉ Email" });
        }

        const cleanEmail = email.trim().toLowerCase();

        // --- LỚP 1: KIỂM TRA ĐỊNH DẠNG VÀ MX RECORD (CÓ CƠ CHẾ CẢNH BÁO AN TOÀN) ---
        try {
    const resValidate = await validate({
        email: cleanEmail,
        validateRegex: true,
        validateMx: false,
        validateTypo: false,
        validateDisposable: true,
    });

    if (!resValidate.valid) {
        let reason = "Email không hợp lệ.";

        if (resValidate.reason === "disposable") {
            reason = "Không hỗ trợ Email rác dùng 1 lần!";
        }

        return res.status(400).json({
            message: reason
        });
    }

} catch (valErr) {
    console.warn(
        "Không thể kiểm tra Email, tiếp tục gửi OTP:",
        valErr.message
    );
}
        // --- LỚP 2: TẠO VÀ LƯU OTP VÀO REDIS (3 PHÚT) ---
        const otp = generateOTP();
        const redisKey = `otp:${cleanEmail}`;
        await redisClient.setEx(redisKey, 180, otp);

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f9f5; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #2e7d32; text-align: center;">Mã xác thực Email 🌱</h2>
                <p>Xin chào,</p>
                <p>Mã OTP xác thực địa chỉ Email của bạn tại <strong>Nông Sản Shop</strong> là:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #d32f2f; letter-spacing: 5px; background: #fff; padding: 10px 20px; border: 1px dashed #d32f2f; border-radius: 8px; display: inline-block;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 13px; color: #666; text-align: center;">Mã này có hiệu lực trong <strong>3 phút</strong>. Vui lòng không chia sẻ cho ai khác.</p>
            </div>
        `;

        const emailSent = await sendEmail(
    cleanEmail,
    "[Nông Sản Shop] Mã xác thực OTP Email",
    htmlContent
);

if (!emailSent) {
    // Nếu gửi email thất bại thì xóa OTP khỏi Redis
    await redisClient.del(redisKey);

    return res.status(500).json({
        message: "Không thể gửi OTP đến Email. Vui lòng kiểm tra cấu hình Email."
    });
}

res.json({
    message: "Đã gửi mã OTP thành công! Vui lòng kiểm tra hộp thư Gmail."
});

    } catch (error) {
        console.error("Lỗi gửi OTP chi tiết:", error);
        res.status(500).json({ message: "Không thể gửi email xác nhận. Vui lòng kiểm tra lại cấu hình Nodemailer/Email." });
    }
};

// ===== ĐĂNG KÝ (ĐÃ YÊU CẦU BẮT BUỘC OTP) =====
const register = async (req, res) => {
    try {
        const { hoTen, email, soDienThoai, password, otp } = req.body;

        if (!hoTen || !email || !soDienThoai || !password || !otp) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bao gồm mã OTP xác thực" });
        }

        // XÁC MINH MÃ OTP
        const isOtpValid = await verifyOTPLogic(email, otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Mã OTP xác thực Email không chính xác hoặc đã hết hạn!" });
        }

        const existingUser = await authModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
                HoTen: user.HoTen || "",
                SoDienThoai: user.SoDienThoai || "",
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// ===== TẠO ADMIN =====
const registerAdmin = async (req, res) => {
    try {
        const { tenDangNhap, email, matKhau, soDienThoai } = req.body;

        if (!email || !matKhau || !tenDangNhap) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        const existingUser = await authModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        const hashedPassword = await bcrypt.hash(matKhau, 10);
        const maTK = await authModel.createAdmin(tenDangNhap, hashedPassword, email, soDienThoai);

        res.status(201).json({ message: "Tạo tài khoản Admin thành công", maTK });
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
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
        }

        const user = await authModel.findById(maTK);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const isMatch = await bcrypt.compare(matKhauCu, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }

        const hashedNewPassword = await bcrypt.hash(matKhauMoi, 10);
        await authModel.updatePassword(maTK, hashedNewPassword);

        try {
            await notificationModel.createNotification(
                maTK,
                'account',
                'Cập nhật mật khẩu thành công 🔒',
                'Mật khẩu tài khoản của bạn đã được thay đổi an toàn.'
            );
        } catch (errNotify) {
            console.error("Lỗi gửi thông báo đổi mật khẩu:", errNotify);
        }

        res.status(200).json({ message: "Đổi mật khẩu thành công" });
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
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const isMatch = await bcrypt.compare(password, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ valid: false, message: "Mật khẩu không chính xác" });
        }

        res.json({ valid: true, message: "Xác thực thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// ===== CẬP NHẬT HỒ SƠ =====
const updateProfile = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        const { hoTen, soDienThoai, email, gioiTinh, ngaySinh } = req.body; 

        if (!hoTen || !soDienThoai || !email) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email" });
        }

        const existingUser = await authModel.findByEmail(email);
        if (existingUser && existingUser.MaTK !== maTK) {
             return res.status(400).json({ message: "Email này đã được tài khoản khác sử dụng" });
        }

        await authModel.updateProfile(maTK, { hoTen, soDienThoai, email, gioiTinh, ngaySinh });

        res.status(200).json({
            message: "Cập nhật hồ sơ thành công",
            user: { hoTen, soDienThoai, email, gioiTinh, ngaySinh }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

module.exports = {
    sendOTP,
    verifyOTPLogic,
    register,
    login,
    registerAdmin,
    changePassword,
    verifyPassword,
    updateProfile
};