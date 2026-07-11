import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log("Role nhận được:", JSON.stringify(data.user.vaiTro));

            if (!res.ok) {
                setError(data.message || "Đăng nhập thất bại");
                return;
            }

           // Lưu token và thông tin user vào localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Đăng nhập thành công!");

            // Điều hướng theo vai trò
            if (data.user.vaiTro === "Admin") {
                navigate("/admin"); // đổi lại nếu route admin của bạn khác
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            setError("Không thể kết nối tới máy chủ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div
                className="p-4 shadow-sm rounded"
                style={{ width: "100%", maxWidth: "400px" }}
            >
                <h3 className="text-center mb-4">Đăng nhập</h3>

                {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Nhập email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-dark w-100 mt-2"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>

                <p className="text-center mt-3">
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;