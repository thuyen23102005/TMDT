import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hoTen: "",
        email: "",
        soDienThoai: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // States gửi OTP
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // HÀM GỬI MÃ OTP
    const handleSendOTP = async () => {
        if (!formData.email) {
            setError("Vui lòng nhập Email trước khi lấy mã OTP!");
            return;
        }

        setError("");
        setIsSendingOtp(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await res.json();
            setIsSendingOtp(false);

            if (!res.ok) {
                setError(data.message || "Gửi mã OTP thất bại");
                return;
            }

            alert(data.message);
            setIsOtpSent(true);

            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error(err);
            setError("Không thể kết nối máy chủ gửi OTP");
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.otp) {
            setError("Vui lòng bấm nút lấy OTP và nhập mã xác thực từ Gmail!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu nhập lại không khớp!");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hoTen: formData.hoTen,
                    email: formData.email,
                    soDienThoai: formData.soDienThoai,
                    password: formData.password,
                    otp: formData.otp,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Đăng ký thất bại");
                return;
            }

            alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Không thể kết nối tới máy chủ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ns-auth-page">
            <div className="ns-auth-wrapper">
                <div className="ns-auth-visual">
                    <div className="ns-auth-visual-overlay">
                        <div className="ns-auth-brand">
                            <span style={{ fontSize: "40px" }}>🌱</span>
                            <span className="ns-auth-brand-name">Nông Sản Shop</span>
                        </div>
                        <h2 className="ns-auth-tagline">
                            Tham gia cùng chúng tôi,<br />mua sắm nông sản dễ dàng hơn
                        </h2>
                        <p className="ns-auth-subtext">
                            Tạo tài khoản để theo dõi đơn hàng, nhận ưu đãi độc quyền
                            và trải nghiệm mua sắm nhanh chóng hơn.
                        </p>

                        <div className="ns-auth-features">
                            <div className="ns-auth-feature">
                                <span>🎁</span> Giảm 10% cho đơn đầu tiên
                            </div>
                            <div className="ns-auth-feature">
                                <span>📦</span> Theo dõi đơn hàng dễ dàng
                            </div>
                            <div className="ns-auth-feature">
                                <span>🔔</span> Nhận thông báo khuyến mãi
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ns-auth-form-side">
                    <div className="ns-auth-card">
                        <div className="ns-auth-card-header">
                            <span style={{ fontSize: "30px" }}>📝</span>
                            <h3>Đăng ký</h3>
                            <p className="ns-auth-subtitle">Tạo tài khoản mới chỉ trong 1 phút</p>
                        </div>

                        {error && (
                            <div className="ns-auth-alert">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="ns-auth-field">
                                <label className="ns-auth-label">Họ và tên</label>
                                <div className="ns-auth-input-wrap">
                                    <span className="ns-auth-input-icon">🧑</span>
                                    <input
                                        type="text"
                                        name="hoTen"
                                        className="ns-auth-input"
                                        placeholder="Nhập họ và tên"
                                        value={formData.hoTen}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* EMAIL + NÚT GỬI OTP */}
                            <div className="ns-auth-field">
                                <label className="ns-auth-label">Email</label>
                                <div className="ns-auth-input-wrap">
                                    <span className="ns-auth-input-icon">✉️</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="ns-auth-input"
                                        placeholder="Nhập email của bạn"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={isSendingOtp || countdown > 0}
                                        className="btn-send-otp"
                                    >
                                        {isSendingOtp ? "..." : countdown > 0 ? `${countdown}s` : "Gửi OTP"}
                                    </button>
                                </div>
                            </div>

                            {/* Ô NHẬP OTP */}
                            {isOtpSent && (
                                <div className="ns-auth-field">
                                    <label className="ns-auth-label" style={{ color: '#2e7d32' }}>Mã OTP (6 số từ Gmail)</label>
                                    <div className="ns-auth-input-wrap otp-active">
                                        <span className="ns-auth-input-icon">🔑</span>
                                        <input
                                            type="text"
                                            name="otp"
                                            maxLength={6}
                                            className="ns-auth-input"
                                            placeholder="123456"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="ns-auth-field">
                                <label className="ns-auth-label">Số điện thoại</label>
                                <div className="ns-auth-input-wrap">
                                    <span className="ns-auth-input-icon">📱</span>
                                    <input
                                        type="tel"
                                        name="soDienThoai"
                                        className="ns-auth-input"
                                        placeholder="Nhập số điện thoại"
                                        value={formData.soDienThoai}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ns-auth-field">
                                <label className="ns-auth-label">Mật khẩu</label>
                                <div className="ns-auth-input-wrap">
                                    <span className="ns-auth-input-icon">🔒</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="ns-auth-input"
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="ns-auth-toggle-eye"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        aria-label="Hiện/ẩn mật khẩu"
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className="ns-auth-field">
                                <label className="ns-auth-label">Nhập lại mật khẩu</label>
                                <div className="ns-auth-input-wrap">
                                    <span className="ns-auth-input-icon">🔒</span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="ns-auth-input"
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="ns-auth-toggle-eye"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                        aria-label="Hiện/ẩn mật khẩu"
                                    >
                                        {showConfirmPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="ns-auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Đang xử lý..." : "Đăng ký"}
                            </button>
                        </form>

                        <p className="ns-auth-switch">
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;