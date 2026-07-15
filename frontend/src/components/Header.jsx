
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
    const [keyword, setKeyword] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };

    return (
        <div
            className="d-flex justify-content-between align-items-center px-4 py-3"
            style={{ backgroundColor: "#fff", borderBottom: "1px solid #eee", gap: "20px" }}
        >
            <Link to="/" className="d-flex align-items-center text-decoration-none flex-shrink-0" style={{ gap: "8px" }}>
                <span style={{ fontSize: "26px" }}>🌱</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#2e7d32" }}>
                    Nông Sản Shop
                </span>
            </Link>

            <form onSubmit={handleSearch} className="d-flex flex-grow-1" style={{ maxWidth: "500px" }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ borderRadius: "20px 0 0 20px", borderRight: "none" }}
                />
                <button
                    type="submit"
                    className="btn"
                    style={{ borderRadius: "0 20px 20px 0", backgroundColor: "#2e7d32", color: "#fff", border: "1px solid #2e7d32", padding: "0 20px" }}
                >
                    🔍
                </button>
            </form>

            <nav className="d-flex align-items-center flex-shrink-0" style={{ gap: "28px" }}>
                <Link
                    to="/products"
                    className="text-decoration-none fw-medium"
                    style={{ color: "#333", fontSize: "15px" }}
                >
                    Sản phẩm
                </Link>

                {user && user.vaiTro === "Admin" && (
                    <Link
                        to="/admin"
                        className="text-decoration-none fw-medium"
                        style={{ color: "#333", fontSize: "15px" }}
                    >
                        Trang Quản Trị
                    </Link>
                )}

                <Link
                    to="/cart"
                    className="text-decoration-none fw-medium px-3 py-2"
                    style={{
                        backgroundColor: "#f57c00",
                        color: "#fff",
                        borderRadius: "20px",
                        fontSize: "14px",
                        boxShadow: "0 2px 6px rgba(245, 124, 0, 0.3)",
                    }}
                >
                    🛒 Giỏ hàng
                </Link>

                {user ? (
                    <>
                        <span className="fw-medium" style={{ color: "#333", fontSize: "15px" }}>
                            Xin chào, {user.HoTen || user.Ten || user.email}
                        </span>
                        <Link
                            to="/profile"
                            title="Trang cá nhân"
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                backgroundColor: "#e8f5e9",
                                color: "#2e7d32",
                                textDecoration: "none",
                                fontSize: "18px",
                                border: "1px solid #c8e6c9",
                            }}
                        >
                            👤
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2"
                            style={{
                                backgroundColor: "transparent",
                                color: "#d32f2f",
                                borderRadius: "20px",
                                border: "1.5px solid #d32f2f",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#d32f2f";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#d32f2f";
                            }}
                        >
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-decoration-none fw-medium px-3 py-2"
                            style={{
                                color: "#2e7d32",
                                fontSize: "14px",
                                fontWeight: "500",
                                border: "1.5px solid #2e7d32",
                                borderRadius: "20px",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#2e7d32";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#2e7d32";
                            }}
                        >
                            Đăng nhập
                        </Link>

                        <Link
                            to="/register"
                            className="text-decoration-none fw-medium px-3 py-2"
                            style={{
                                backgroundColor: "#2e7d32",
                                color: "#fff",
                                borderRadius: "20px",
                                fontSize: "14px",
                                fontWeight: "500",
                                boxShadow: "0 2px 6px rgba(46, 125, 50, 0.3)",
                            }}
                        >
                            Đăng ký
                        </Link>
                    </>
                )}
            </nav>
        </div>
    );
}

export default Header;