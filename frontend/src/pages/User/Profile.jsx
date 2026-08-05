import './Profile.css';
import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import TreasureChestWidget from '../../components/TreasureChestWidget/TreasureChestWidget';

function Profile() {

    const location = useLocation();

    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);

    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    
    // States cho phần hiển thị ưu đãi Rank
    const [showBenefits, setShowBenefits] = useState(false);
    const [activeTab, setActiveTab] = useState("Vàng");

    const fileInputRef = useRef(null);

    const fetchOrders = () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            fetch(`${import.meta.env.VITE_API_URL}/api/orders/user/${storedUser.maTK}`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.log(err));
        }
    };

    useEffect(() => {
        const loadUser = () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            setUser(storedUser);
            if (storedUser?.avatarUrl) {
                setAvatarUrl(storedUser.avatarUrl);
            }
        };

        loadUser();
        fetchOrders();

        window.addEventListener("userUpdated", loadUser);
        return () => window.removeEventListener("userUpdated", loadUser);
    }, [location.pathname]);

    const totalOrders = orders.length;

    const totalSpent = orders
        .filter(o => o.TrangThaiThanhToan === "Đã thanh toán")
        .reduce((sum, o) => sum + Number(o.TongTien), 0);

    const displayName = user ? (user.HoTen || user.email) : "Họ và tên";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarUrl(URL.createObjectURL(file));
    };

    const isPathActive = (path) => {
        return path === "/profile"
            ? location.pathname === "/profile"
            : location.pathname.includes(path);
    };

    // ==========================================
    // LOGIC TÍNH HẠNG THÀNH VIÊN (RANK)
    // ==========================================
    const diemXepHang = Math.floor(totalSpent / 500); 

    let currentRank = "Đồng";
    let nextRank = "Bạc";
    let minPoint = 0;
    let maxPoint = 1000;
    let rankColor = "#cd7f32"; 
    let rankIcon = "🥉";
    let rankGradient = "linear-gradient(135deg, #cd7f32, #ffcc80, #cd7f32)";

    if (diemXepHang >= 10000) {
        currentRank = "Kim Cương";
        nextRank = "Tối đa";
        minPoint = 10000;
        maxPoint = 10000;
        rankColor = "#00bcd4"; 
        rankIcon = "💎";
        rankGradient = "linear-gradient(135deg, #00bcd4, #b2ebf2, #00bcd4)";
    } else if (diemXepHang >= 5000) {
        currentRank = "Vàng";
        nextRank = "Kim Cương";
        minPoint = 5000;
        maxPoint = 10000;
        rankColor = "#ffd700"; 
        rankIcon = "🥇";
        rankGradient = "linear-gradient(135deg, #ffd700, #fff59d, #ffd700)";
    } else if (diemXepHang >= 1000) {
        currentRank = "Bạc";
        nextRank = "Vàng";
        minPoint = 1000;
        maxPoint = 5000;
        rankColor = "#9e9e9e"; 
        rankIcon = "🥈";
        rankGradient = "linear-gradient(135deg, #9e9e9e, #e0e0e0, #9e9e9e)";
    }

    const progressPercent = currentRank === "Kim Cương"
        ? 100
        : ((diemXepHang - minPoint) / (maxPoint - minPoint)) * 100;

    const pointsNeeded = currentRank === "Kim Cương" ? 0 : maxPoint - diemXepHang;

    useEffect(() => {
        setActiveTab(currentRank);
    }, [currentRank]);

    const rankBenefits = {
        "Đồng": [
            { icon: "🚚", title: "Miễn phí vận chuyển", desc: "Tặng 1 mã Freeship mỗi tháng" },
            { icon: "🎂", title: "Ưu đãi Sinh nhật", desc: "Voucher giảm 5% (tối đa 20.000đ)" }
        ],
        "Bạc": [
            { icon: "🚚", title: "Miễn phí vận chuyển", desc: "Tặng 2 mã Freeship mỗi tháng" },
            { icon: "🏷️", title: "Voucher độc quyền", desc: "Giảm 5% cho đơn từ 200.000đ" },
            { icon: "🎂", title: "Ưu đãi Sinh nhật", desc: "Voucher giảm 10% (tối đa 50.000đ)" }
        ],
        "Vàng": [
            { icon: "🚚", title: "Miễn phí vận chuyển", desc: "Tặng 4 mã Freeship mỗi tháng" },
            { icon: "👑", title: "Ngày hội Thành viên", desc: "Nhận x2 điểm thưởng ngày 15 hàng tháng" },
            { icon: "🎁", title: "Quà tặng Thăng hạng", desc: "Tặng ngay 1 voucher 50.000đ khi lên hạng" },
            { icon: "🎂", title: "Ưu đãi Sinh nhật", desc: "Voucher giảm 15% (tối đa 100.000đ)" }
        ],
        "Kim Cương": [
            { icon: "🚚", title: "Miễn phí vận chuyển", desc: "Freeship không giới hạn (tối đa 30k/đơn)" },
            { icon: "👑", title: "Ngày hội Thành viên", desc: "Nhận x3 điểm thưởng ngày 15 hàng tháng" },
            { icon: "🎁", title: "Quà tặng Thăng hạng", desc: "Tặng ngay 1 voucher 100.000đ khi lên hạng" },
            { icon: "🎧", title: "Chăm sóc Đặc quyền", desc: "Hotline hỗ trợ riêng biệt ưu tiên 24/7" },
            { icon: "🎂", title: "Ưu đãi Sinh nhật", desc: "Voucher giảm 20% (tối đa 200.000đ)" }
        ]
    };

    const showRewardSection = location.pathname === "/profile" || location.pathname === "/profile/" || location.pathname.includes("/profile/uu-dai");

    return (
        <div className="row g-4 pt-0 pb-5 profile-container">
            <div className="col-md-3">
                <div className="rounded-4 p-4 text-center mb-3 profile-user-card">
                    {/* KHUNG AVATAR CÓ VIỀN RANK */}
                    <div
                        className="rounded-circle mx-auto mb-3 position-relative avatar-rank-frame"
                        style={{ background: rankGradient }}
                    >
                        {/* ẢNH AVATAR BÊN TRONG */}
                        <div
                            onMouseEnter={() => setIsHoveringAvatar(true)}
                            onMouseLeave={() => setIsHoveringAvatar(false)}
                            onClick={() => fileInputRef.current.click()}
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold w-100 h-100 position-relative avatar-inner"
                            style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none" }}
                        >
                            {!avatarUrl && avatarLetter}

                            {isHoveringAvatar && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center avatar-overlay">
                                    📷
                                </div>
                            )}
                        </div>

                        {/* HUY HIỆU RANK GẮN Ở GÓC AVATAR */}
                        <div
                            className="position-absolute d-flex align-items-center justify-content-center rank-badge"
                            style={{
                                backgroundColor: rankColor,
                                color: currentRank === "Vàng" ? "#000" : "#fff"
                            }}
                        >
                            {rankIcon} {currentRank}
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="d-none"
                    />

                    <strong>{displayName}</strong>
                </div>

                <div className="rounded-4 p-3 bg-white">
                    <h6>Thông tin tài khoản</h6>
                    <Link to="/profile" className={`profile-menu-link ${isPathActive("/profile") ? "active" : ""}`}>👤 Hồ sơ cá nhân</Link>
                    <Link to="/profile/dia-chi" className={`profile-menu-link ${isPathActive("/profile/dia-chi") ? "active" : ""}`}>📍 Sổ địa chỉ</Link>
                    <Link to="/profile/doi-mat-khau" className={`profile-menu-link ${isPathActive("/profile/doi-mat-khau") ? "active" : ""}`}>🔒 Đổi mật khẩu</Link>
                    <Link to="/profile/uu-dai" className={`profile-menu-link ${isPathActive("/profile/uu-dai") ? "active" : ""}`}>🎁 Ưu đãi thành viên</Link>
                    <hr />
                    <Link to="/profile/don-hang" className={`profile-menu-link ${isPathActive("/profile/don-hang") ? "active" : ""}`}>📄 Đơn hàng của tôi</Link>
                    <Link to="/profile/vi-voucher" className={`profile-menu-link ${isPathActive("/profile/vi-voucher") ? "active" : ""}`}>🎟️ Ví voucher</Link>
                    <Link to="/profile/thong-bao" className={`profile-menu-link ${isPathActive("/profile/thong-bao") ? "active" : ""}`}>✉️ Thông báo</Link>
                    <Link to="/profile/yeu-thich" className={`profile-menu-link ${isPathActive("/profile/yeu-thich") ? "active" : ""}`}>♡ Sản phẩm yêu thích</Link>
                    <Link to="/profile/danh-gia" className={`profile-menu-link ${isPathActive("/profile/danh-gia") ? "active" : ""}`}>★ Đánh giá của tôi</Link>
                </div>
            </div>

            <div className="col-md-9 profile-content-col">
                <div className="rounded-4 mb-3 p-4 profile-greeting-banner">
                    <h4 className="m-0">Xin chào {displayName}</h4>
                </div>

                {/* BỌC TOÀN BỘ KHỐI ĐIỂM THƯỞNG BẰNG ĐIỀU KIỆN ẨN/HIỆN */}
                {showRewardSection && (
                    <>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <div className="bg-white rounded-4 p-4 border h-100">
                                    <h6>🎁 Ưu đãi</h6>
                                    <h3>
                                        {(totalSpent * 0.1).toLocaleString()}
                                    </h3>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="bg-white rounded-4 p-4 border h-100">
                                    <h6>🏆 Thành tích</h6>
                                    <p className="mb-2">
                                        Số đơn hàng đã đặt là: <strong>{totalOrders}</strong> đơn hàng
                                    </p>
                                    <p className="mb-0">
                                        Tổng số tiền đã thanh toán: <strong>{totalSpent.toLocaleString()} đ</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-4 p-4 border-0 shadow-sm mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div 
                                        className="d-flex align-items-center justify-content-center rounded-circle rank-icon-box"
                                        style={{ border: `2px solid ${rankColor}` }}
                                    >
                                        {rankIcon}
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold text-uppercase" style={{ color: rankColor }}>Hạng {currentRank}</h5>
                                        <span className="text-muted">Điểm tích lũy: <strong className="text-dark">{diemXepHang.toLocaleString()} / {maxPoint.toLocaleString()}</strong></span>
                                    </div>
                                </div>

                                {currentRank !== "Kim Cương" ? (
                                    <div className="text-end bg-light px-3 py-2 rounded-3">
                                        <small className="text-muted d-block">Lên hạng <strong>{nextRank}</strong></small>
                                        <small className="rank-needed-badge">Cần thêm {pointsNeeded.toLocaleString()} điểm</small>
                                    </div>
                                ) : (
                                    <div className="text-end bg-light px-3 py-2 rounded-3">
                                        <small className="text-muted d-block">Chúc mừng!</small>
                                        <small className="fw-bold" style={{ color: rankColor }}>Đã đạt thứ hạng cao nhất</small>
                                    </div>
                                )}
                            </div>

                            <div className="progress mt-4 rank-progress-bar">
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated rank-progress-fill"
                                    role="progressbar"
                                    style={{
                                        width: `${progressPercent}%`,
                                        backgroundColor: rankColor
                                    }}
                                    aria-valuenow={progressPercent}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                            
                            <div className="d-flex justify-content-between mt-2 px-1 mb-4">
                                <small className="text-muted fw-bold">{minPoint.toLocaleString()} điểm</small>
                                {currentRank !== "Kim Cương" && <small className="text-muted fw-bold">{maxPoint.toLocaleString()} điểm</small>}
                            </div>

                            <div className="text-center border-top pt-3">
                                <button 
                                    className="btn btn-sm px-4 py-2 fw-bold btn-toggle-benefits"
                                    onClick={() => setShowBenefits(!showBenefits)}
                                >
                                    {showBenefits ? "Thu gọn đặc quyền ▴" : "🎁 Xem đặc quyền các hạng ▾"}
                                </button>
                            </div>

                            {showBenefits && (
                                <div className="mt-4 pt-3">
                                    <h6 className="fw-bold mb-3 text-center rank-benefit-title">THÔNG TIN ƯU ĐÃI CÁC THỨ HẠNG</h6>
                                    
                                    <div className="d-flex justify-content-between border-bottom mb-4">
                                        {Object.keys(rankBenefits).map(rank => (
                                            <div 
                                                key={rank}
                                                onClick={() => setActiveTab(rank)}
                                                className={`rank-tab-item ${activeTab === rank ? "active" : ""}`}
                                            >
                                                {rank}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-flex flex-column gap-3">
                                        {rankBenefits[activeTab].map((benefit, idx) => (
                                            <div key={idx} className="d-flex gap-3 align-items-center bg-light p-3 rounded-4 border-0">
                                                <div className="benefit-icon">{benefit.icon}</div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-dark">{benefit.title}</h6>
                                                    <small className="text-muted">{benefit.desc}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Outlet CHỨA CÁC TRANG CON HIỂN THỊ PHÍA DƯỚI */}
                <div className={`profile-outlet-wrapper ${showRewardSection ? "mt-4" : ""}`}>
                    <Outlet context={{ orders, fetchOrders }} />
                </div>
                <TreasureChestWidget />
            </div>
        </div>
    );
}

export default Profile;