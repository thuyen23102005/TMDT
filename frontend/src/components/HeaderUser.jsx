import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function HeaderUser() {
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
            {/* Logo */}
            <Link
                to="/"
                className="d-flex align-items-center text-decoration-none flex-shrink-0"
                style={{ gap: "8px" }}
            >
                <span style={{ fontSize: "26px" }}>🥕</span>
                <span
                    style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#2e7d32",
                    }}
                >
                    Nông Sản Xanh
                </span>
            </Link>

            {/* Thanh tìm kiếm */}
            <form
                onSubmit={handleSearch}
                className="d-flex flex-grow-1"
                style={{ maxWidth: "500px" }}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{
                        borderRadius: "20px 0 0 20px",
                        borderRight: "none",
                    }}
                />
                <button
                    type="submit"
                    className="btn"
                    style={{
                        borderRadius: "0 20px 20px 0",
                        backgroundColor: "#2e7d32",
                        color: "#fff",
                        border: "1px solid #2e7d32",
                        padding: "0 20px",
                    }}
                >
                    🔍
                </button>
            </form>

            {/* Menu */}
            <nav className="d-flex align-items-center flex-shrink-0" style={{ gap: "20px" }}>
                <Link
                    to="/"
                    className="text-decoration-none fw-medium"
                    style={{ color: "#333" }}
                >
                    Trang chủ
                </Link>

                {user ? (
                    <>
                        <Link
                            to="/profile"
                            className="text-decoration-none fw-medium"
                            style={{ color: "#333" }}
                        >
                            Xin chào, {user.HoTen || user.Ten || user.email}
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="text-decoration-none fw-medium px-3 py-2"
                            style={{
                                backgroundColor: "#d32f2f",
                                color: "#fff",
                                borderRadius: "20px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-decoration-none fw-medium"
                            style={{ color: "#333" }}
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

export default HeaderUser;