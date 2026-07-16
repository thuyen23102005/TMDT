import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
    const [keyword, setKeyword] = useState("");
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0); 
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchUnreadCount(parsedUser.maTK);
        }

        const handleNotificationUpdate = () => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser) {
                fetchUnreadCount(currentUser.maTK);
            }
        };

        window.addEventListener('updateNotificationCount', handleNotificationUpdate);
        return () => window.removeEventListener('updateNotificationCount', handleNotificationUpdate);
    }, []);

    useEffect(() => {
        if (!user) return;
        const timer = setInterval(() => {
            fetchUnreadCount(user.maTK);
        }, 30000); 
        return () => clearInterval(timer);
    }, [user]);

    const fetchUnreadCount = (maTK) => {
        fetch(`http://localhost:5000/api/notifications/${maTK}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const count = data.filter(notif => !notif.DaDoc).length;
                    setUnreadCount(count);
                }
            })
            .catch(err => console.error("Lỗi đếm thông báo Header:", err));
    };

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
        setUnreadCount(0); 
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

            <nav className="d-flex align-items-center flex-shrink-0" style={{ gap: "25px" }}>
                <Link
                    to="/products"
                    className="text-decoration-none fw-medium"
                    style={{ color: "#333", fontSize: "15px" }}
                >
                    Sản phẩm
                </Link>

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
                        {/* CHUÔNG ĐƯỢC ÉP CSS TRONG SUỐT HOÀN TOÀN */}
                        <Link 
                            to="/profile/thong-bao" 
                            title="Thông báo"
                            style={{ 
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px", 
                                height: "40px", 
                                textDecoration: "none",
                                backgroundColor: "transparent", /* ÉP BUỘC TRONG SUỐT */
                                background: "none",
                                border: "none",
                                outline: "none",
                                cursor: "pointer"
                            }}
                        >
                            <span style={{ fontSize: "22px", background: "transparent", lineHeight: "1" }}>🔔</span>
                            
                            {/* CHẤM ĐỎ */}
                            {unreadCount > 0 && (
                                <span 
                                    style={{ 
                                        position: "absolute",
                                        top: "0px", 
                                        right: "0px", 
                                        backgroundColor: "#d32f2f",
                                        color: "white",
                                        fontSize: "10px", 
                                        fontWeight: "bold",
                                        padding: "3px 5px",
                                        borderRadius: "50%",
                                        border: "2px solid #fff",
                                        lineHeight: "1"
                                    }}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>

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