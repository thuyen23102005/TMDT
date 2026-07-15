import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Profile() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage để hiển thị tên
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        if (storedUser?.avatarUrl) setAvatarUrl(storedUser.avatarUrl);

        // Luôn gọi API lấy đơn hàng khi vào Profile để tính toán thành tích
        if (storedUser) {
            fetch(`http://localhost:5000/api/orders/user/${storedUser.maTK}`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error("Lỗi kéo đơn hàng:", err));
        }
    }, [location.pathname]);

    // TÍNH TOÁN THÀNH TÍCH
    const totalOrders = orders.length;
    const totalSpent = orders
        .filter(o => o.TrangThaiThanhToan === 'Đã thanh toán')
        .reduce((sum, o) => sum + Number(o.TongTien), 0);

    const displayName = user ? (user.HoTen || user.email) : 'Họ và tên';
    const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : '?';

    // Chọn ảnh -> preview ngay + (TODO) gọi API upload lên server
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setAvatarUrl(previewUrl);
    };

    // Style cơ bản cho các menu item
    const menuLinkStyle = {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        transition: "all 0.15s ease",
        textDecoration: "none",
    };

    // 🌟 HÀM HELPER: Kiểm tra xem mục hiện tại có đang kích hoạt (Active) hay không
    const getActiveStyle = (path) => {
        const isActive = path === "/profile" 
            ? location.pathname === "/profile" 
            : location.pathname.includes(path);

        return {
            ...menuLinkStyle,
            color: isActive ? "#2e7d32" : "#212529", // Màu xanh lá khi active, màu đen thường khi không active
            fontWeight: isActive ? 700 : 400,        // In đậm khi active
            backgroundColor: isActive ? "rgba(46,125,50,0.08)" : "transparent", // Nền xanh nhạt khi active
        };
    };

    return (
        <div className="row g-4 pb-5">
            {/* Sidebar */}
            <div className="col-md-3">
                <div
                    className="rounded-4 p-4 text-center mb-3"
                    style={{
                        background: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
                        color: "#fff",
                        boxShadow: "0 6px 18px rgba(46,125,50,0.25)",
                    }}
                >
                    {/* Avatar + overlay upload khi hover */}
                    <div
                        onMouseEnter={() => setIsHoveringAvatar(true)}
                        onMouseLeave={() => setIsHoveringAvatar(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold position-relative"
                        style={{
                            width: "84px",
                            height: "84px",
                            background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : "rgba(255,255,255,0.2)",
                            border: "3px solid rgba(255,255,255,0.6)",
                            fontSize: "32px",
                            cursor: "pointer",
                            overflow: "hidden",
                        }}
                    >
                        {!avatarUrl && avatarLetter}

                        {isHoveringAvatar && (
                            <div
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                                style={{
                                    background: "rgba(0,0,0,0.55)",
                                    color: "#fff",
                                    fontSize: "11px",
                                    gap: "2px",
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>📷</span>
                                <span>Tải ảnh</span>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                    />

                    <strong style={{ wordBreak: "break-word" }}>{displayName}</strong>
                </div>

                <div className="rounded-4 p-3 bg-white" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <div className="fw-bold mb-2 text-secondary text-uppercase small px-2">
                        Thông tin tài khoản
                    </div>
                    <ul className="list-unstyled mb-2">
                        <li>
                            <Link to="/profile" style={getActiveStyle("/profile")}>
                                👤 Hồ sơ cá nhân
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile/dia-chi" style={getActiveStyle("/profile/dia-chi")}>
                                📍 Sổ địa chỉ
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile/doi-mat-khau" style={getActiveStyle("/profile/doi-mat-khau")}>
                                🔒 Đổi mật khẩu
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile/uu-dai" style={getActiveStyle("/profile/uu-dai")}>
                                🎁 Ưu đãi thành viên
                            </Link>
                        </li>
                    </ul>
                    <hr className="my-2" />
                    <ul className="list-unstyled mb-0">
                        <li>
                            <Link to="/profile/don-hang" style={getActiveStyle("/profile/don-hang")}>
                                📄 Đơn hàng của tôi
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="text-dark text-decoration-none d-block" style={menuLinkStyle}>
                                🎟️ Ví voucher
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-dark text-decoration-none d-block" style={menuLinkStyle}>
                                ✉️ Thông báo
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-dark text-decoration-none d-block" style={menuLinkStyle}>
                                ♡ Sản phẩm yêu thích
                            </a>
                        </li>
                        <li>
                            <a href="#" className="text-dark text-decoration-none d-block" style={menuLinkStyle}>
                                ★ Đánh giá của tôi
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Nội dung chính - thay đổi theo route con */}
            <div className="col-md-9">
                {/* Banner ưu đãi + thành tích */}
                <div
                    className="rounded-4 mb-3 d-flex align-items-center px-4"
                    style={{
                        height: "140px",
                        background: "linear-gradient(120deg, #1b5e20 0%, #43a047 55%, #a5d6a7 100%)",
                        color: "#fff",
                    }}
                >
                    <div>
                        <div className="fs-4 fw-bold mb-1">Xin chào, {displayName.split('@')[0]} 👋</div>
                        <div style={{ opacity: 0.9 }}>Cảm ơn bạn đã đồng hành cùng Nông Sản Shop</div>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <div
                            className="rounded-4 p-4 h-100 bg-white"
                            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                        >
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span>🎁</span>
                                <strong className="text-secondary text-uppercase small">Ưu đãi của bạn</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <div className="text-muted small mb-1">Điểm hiện có</div>
                                    <div className="fs-4 fw-bold text-success">
                                        {(totalSpent * 0.1).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="text-muted small mb-1">Free ship hiện có</div>
                                    <div className="fs-4 fw-bold text-success">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div
                            className="rounded-4 p-4 h-100 bg-white"
                            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                        >
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span>🏆</span>
                                <strong className="text-secondary text-uppercase small">Thành tích của năm nay</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <div className="text-muted small mb-1">Số đơn hàng</div>
                                    <div className="fs-4 fw-bold">{totalOrders} đơn hàng</div>
                                </div>
                                <div className="text-end">
                                    <div className="text-muted small mb-1">Đã thanh toán</div>
                                    <div className="fs-4 fw-bold text-success">{totalSpent.toLocaleString()} đ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Route con render tại đây */}
                <div className="mt-3">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Profile;