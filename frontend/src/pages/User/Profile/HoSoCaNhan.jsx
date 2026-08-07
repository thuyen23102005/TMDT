import { useState, useEffect } from "react";

// --- Small inline icons (no extra dependency needed) ---
const IconUser = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
);
const IconPhone = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" />
    </svg>
);
const IconMail = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 6-10 7L2 6" />
    </svg>
);
const IconCalendar = (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
);
const IconLock = (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

function HoSoCaNhan() {
    const [formData, setFormData] = useState({
        hoTen: "",
        soDienThoai: "",
        email: "",
        gioiTinh: "nam",
        ngaySinh: "",
    });

    const [originalEmail, setOriginalEmail] = useState("");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setFormData((prev) => ({
                ...prev,
                hoTen: storedUser.HoTen || "",
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
        setSaveMessage("");

        if (formData.email !== originalEmail) {
            setPasswordError("");
            setConfirmPassword("");
            setShowPasswordModal(true);
            return;
        }

        saveProfile();
    };

    const saveProfile = async () => {
        setIsSaving(true);
        setSaveMessage("");

        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    hoTen: formData.hoTen,
                    soDienThoai: formData.soDienThoai,
                    email: formData.email,
                    gioiTinh: formData.gioiTinh,
                    ngaySinh: formData.ngaySinh,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSaveMessage(data.message || "Cập nhật thất bại, vui lòng thử lại.");
                return;
            }

            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = {
                ...storedUser,
                HoTen: formData.hoTen,
                SoDienThoai: formData.soDienThoai,
                email: formData.email,
                GioiTinh: formData.gioiTinh,
                NgaySinh: formData.ngaySinh,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            window.dispatchEvent(new Event("userUpdated"));

            setSaveMessage("Cập nhật hồ sơ thành công!");
        } catch (err) {
            console.error("Lỗi cập nhật hồ sơ:", err);
            setSaveMessage("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmPassword = async () => {
        if (!confirmPassword) {
            setPasswordError("Vui lòng nhập mật khẩu.");
            return;
        }

        setIsVerifying(true);
        setPasswordError("");

        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-password`, {
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

            await saveProfile();
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

    const emailChanged = formData.email !== originalEmail;

    return (
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5" style={{ maxWidth: 640 }}>

            {/* Header */}
            <div className="mb-4 pb-4 border-bottom">
                <h5 className="mb-1 fw-semibold">Hồ sơ cá nhân</h5>
                <p className="text-muted small mb-0">Cập nhật thông tin tài khoản của bạn</p>
            </div>

            {saveMessage && (
                <div className={`alert ${saveMessage.includes("thành công") ? "alert-success" : "alert-danger"} py-2 small`}>
                    {saveMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row g-3">

                    <div className="col-12">
                        <label className="form-label small text-muted">Họ và tên<span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-muted"><IconUser /></span>
                            <input
                                type="text"
                                name="hoTen"
                                className="form-control"
                                placeholder="Nhập họ và tên"
                                value={formData.hoTen}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small text-muted">Số điện thoại<span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-muted"><IconPhone /></span>
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
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small text-muted">Email</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-muted"><IconMail /></span>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {emailChanged && (
                            <div className="form-text text-warning-emphasis" style={{ fontSize: 12 }}>
                                Email đã thay đổi — cần xác nhận mật khẩu khi lưu.
                            </div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small text-muted d-block">Giới tính</label>
                        <div className="btn-group w-100" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="gioiTinh"
                                id="gioiTinhNam"
                                value="nam"
                                checked={formData.gioiTinh === "nam"}
                                onChange={handleChange}
                            />
                            <label className="btn btn-outline-success" htmlFor="gioiTinhNam">Nam</label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="gioiTinh"
                                id="gioiTinhNu"
                                value="nu"
                                checked={formData.gioiTinh === "nu"}
                                onChange={handleChange}
                            />
                            <label className="btn btn-outline-success" htmlFor="gioiTinhNu">Nữ</label>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small text-muted">Ngày sinh</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-muted"><IconCalendar /></span>
                            <input
                                type="date"
                                name="ngaySinh"
                                className="form-control"
                                value={formData.ngaySinh}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                </div>

                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                    <button
                        type="submit"
                        className="btn btn-success px-4 fw-medium"
                        disabled={isSaving}
                    >
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>

            {showPasswordModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    onClick={() => !isVerifying && setShowPasswordModal(false)}
                >
                    <div
                        className="bg-white rounded-4 p-4 shadow-lg"
                        style={{ width: 400, maxWidth: "90%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="text-success"><IconLock /></span>
                            <h6 className="fw-semibold mb-0">Xác nhận mật khẩu</h6>
                        </div>
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
                                className="btn btn-success"
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