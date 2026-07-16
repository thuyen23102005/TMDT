import { useState, useEffect } from "react";

function HoSoCaNhan() {
    const [formData, setFormData] = useState({
        ho: "",
        ten: "",
        soDienThoai: "",
        email: "",
        gioiTinh: "nam",
        ngaySinh: "",
    });

    // Lưu email gốc để so sánh, phát hiện khi nào người dùng thực sự đổi email
    const [originalEmail, setOriginalEmail] = useState("");

    // State cho modal xác nhận mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        // Nạp thông tin hiện tại của user (nếu có) để so sánh email cũ/mới
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setFormData((prev) => ({
                ...prev,
                ho: storedUser.Ho || "",
                ten: storedUser.Ten || "",
                soDienThoai: storedUser.SoDienThoai || "",
                email: storedUser.email || "",
                gioiTinh: storedUser.GioiTinh || "nam",
                ngaySinh: storedUser.NgaySinh || "",
            }));
            setOriginalEmail(storedUser.email || "");
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Nếu email bị thay đổi so với ban đầu -> bắt buộc xác nhận mật khẩu trước
        if (formData.email !== originalEmail) {
            setPasswordError("");
            setConfirmPassword("");
            setShowPasswordModal(true);
            return;
        }

        // Email không đổi -> lưu bình thường
        saveProfile();
    };

    const saveProfile = () => {
        console.log("Cập nhật hồ sơ:", formData);
        // TODO: gọi API cập nhật hồ sơ thật ở đây
        // fetch(`http://localhost:5000/api/users/${user.maTK}`, { method: 'PUT', body: JSON.stringify(formData), ... })
    };

    const handleConfirmPassword = async () => {
    if (!confirmPassword) {
        setPasswordError("Vui lòng nhập mật khẩu.");
        return;
    }

    setIsVerifying(true);
    setPasswordError("");

    try {
        const token = localStorage.getItem('token'); // token lưu lúc đăng nhập

        const res = await fetch(`http://localhost:5000/api/auth/verify-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ password: confirmPassword }),
        });
        const data = await res.json();

        if (!res.ok || !data.valid) {
            setPasswordError(data.message || "Mật khẩu không chính xác.");
            setIsVerifying(false);
            return;
        }

        saveProfile();
        setOriginalEmail(formData.email);
        setShowPasswordModal(false);
        setConfirmPassword("");
    } catch (err) {
        console.error("Lỗi xác thực mật khẩu:", err);
        setPasswordError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
        setIsVerifying(false);
    }
};
    return (
        <div className="shadow-sm rounded p-4">
            <h5 className="mb-4">Hồ sơ cá nhân</h5>

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Họ*</label>
                        <input
                            type="text"
                            name="ho"
                            className="form-control"
                            placeholder="Họ"
                            value={formData.ho}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tên*</label>
                        <input
                            type="text"
                            name="ten"
                            className="form-control"
                            placeholder="Tên"
                            value={formData.ten}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Số điện thoại*</label>
                    <input
                        type="tel"
                        name="soDienThoai"
                        className="form-control"
                        placeholder="Số điện thoại"
                        value={formData.soDienThoai}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Email
                        {formData.email !== originalEmail && (
                            <span className="text-warning ms-2" style={{ fontSize: "12px" }}>
                                ⚠ Email đã thay đổi, cần xác nhận mật khẩu khi lưu
                            </span>
                        )}
                    </label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label d-block">Giới tính</label>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="gioiTinh"
                            value="nam"
                            checked={formData.gioiTinh === "nam"}
                            onChange={handleChange}
                        />
                        <label className="form-check-label">Nam</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="gioiTinh"
                            value="nu"
                            checked={formData.gioiTinh === "nu"}
                            onChange={handleChange}
                        />
                        <label className="form-check-label">Nữ</label>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label">Ngày sinh</label>
                    <input
                        type="date"
                        name="ngaySinh"
                        className="form-control"
                        value={formData.ngaySinh}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-dark">
                    Lưu thay đổi
                </button>
            </form>

            {/* Modal xác nhận mật khẩu khi đổi email */}
            {showPasswordModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    onClick={() => !isVerifying && setShowPasswordModal(false)}
                >
                    <div
                        className="bg-white rounded-4 p-4"
                        style={{ width: "400px", maxWidth: "90%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h6 className="fw-bold mb-2">Xác nhận mật khẩu</h6>
                        <p className="text-muted small mb-3">
                            Để bảo mật tài khoản, vui lòng nhập mật khẩu hiện tại trước khi đổi email sang{" "}
                            <strong>{formData.email}</strong>.
                        </p>

                        <input
                            type="password"
                            className={`form-control mb-2 ${passwordError ? "is-invalid" : ""}`}
                            placeholder="Nhập mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoFocus
                        />
                        {passwordError && (
                            <div className="text-danger small mb-2">{passwordError}</div>
                        )}

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPasswordModal(false)}
                                disabled={isVerifying}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={handleConfirmPassword}
                                disabled={isVerifying}
                            >
                                {isVerifying ? "Đang kiểm tra..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HoSoCaNhan;