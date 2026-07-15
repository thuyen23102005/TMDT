import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Profile() {
    const location = useLocation();
    const isOrdersTab = location.pathname.includes('don-hang');
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);

    // Tách thành hàm riêng để có thể gọi lại từ trang con
    const fetchOrders = () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            fetch(`http://localhost:5000/api/orders/user/${storedUser.maTK}`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error("Lỗi kéo đơn hàng:", err));
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        fetchOrders(); // Gọi lần đầu khi vào trang
    }, [location.pathname]);

    // TÍNH TOÁN THÀNH TÍCH
    const totalOrders = orders.length;
    // Chỉ tính tổng tiền của những đơn có trạng thái 'Đã thanh toán'
    const totalSpent = orders
        .filter(o => o.TrangThaiThanhToan === 'Đã thanh toán') 
        .reduce((sum, o) => sum + Number(o.TongTien), 0);

    return (
        <div className="row">
            {/* Sidebar */}
            <div className="col-md-3 mb-4">
                <div className="shadow-sm rounded p-3 text-center mb-3">
                    <div
                        className="rounded-circle bg-secondary mx-auto mb-2"
                        style={{ width: "80px", height: "80px" }}
                    ></div>
                    {/* Lấy tên user hoặc email hiển thị ra */}
                    <strong>{user ? (user.HoTen || user.email) : 'Họ và tên'}</strong>
                </div>

                <div className="shadow-sm rounded p-2">
                    <div className="fw-bold mb-2">Thông tin tài khoản</div>
                    <ul className="list-unstyled ms-2">
                        <li className="py-1">
                            <Link to="/profile" className="text-dark text-decoration-none">Hồ sơ cá nhân</Link>
                        </li>
                        <li className="py-1">
                            <Link to="/profile/dia-chi" className="text-dark text-decoration-none">Sổ địa chỉ</Link>
                        </li>
                        <li className="py-1">
                            <Link to="/profile/doi-mat-khau" className="text-dark text-decoration-none">Đổi mật khẩu</Link>
                        </li>
                        <li className="py-1">
                            <Link to="/profile/uu-dai" className="text-dark text-decoration-none">Ưu đãi thành viên</Link>
                        </li>
                    </ul>
                    <hr />
                    <ul className="list-unstyled ms-2">
                        <li className="py-1">
                            <Link to="/profile/don-hang" className={`text-decoration-none ${isOrdersTab ? 'fw-bold text-success' : 'text-dark'}`}>📄 Đơn hàng của tôi</Link>
                        </li>
                        <li className="py-1"><a href="#" className="text-dark text-decoration-none">🎟️ Ví voucher</a></li>
                        <li className="py-1"><a href="#" className="text-dark text-decoration-none">✉️ Thông báo</a></li>
                        <li className="py-1"><a href="#" className="text-dark text-decoration-none">♡ Sản phẩm yêu thích</a></li>
                        <li className="py-1"><a href="#" className="text-dark text-decoration-none">★ Đánh giá của tôi</a></li>
                    </ul>
                </div>
            </div>

            {/* Nội dung chính - thay đổi theo route con */}
            <div className="col-md-9">
                {/* Banner ưu đãi + thành tích */}
                <div className="shadow-sm rounded mb-3 bg-light" style={{ height: "140px" }}></div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="shadow-sm rounded p-3">
                            <strong>ƯU ĐÃI CỦA BẠN</strong>
                            <div className="d-flex justify-content-between mt-2">
                                <div>
                                    <div className="text-muted small">Điểm hiện có</div>
                                    {/* Giả lập điểm = 10% số tiền đã tiêu */}
                                    <div className="fw-bold">{(totalSpent * 0.1).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted small">Free ship hiện có</div>
                                    <div className="fw-bold">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="shadow-sm rounded p-3">
                            <strong>THÀNH TÍCH CỦA NĂM NAY</strong>
                            <div className="d-flex justify-content-between mt-2">
                                <div>
                                    <div className="text-muted small">Số đơn hàng</div>
                                    <div className="fw-bold">{totalOrders} đơn hàng</div>
                                </div>
                                <div>
                                    <div className="text-muted small">Đã thanh toán</div>
                                    <div className="fw-bold text-success">{totalSpent.toLocaleString()} đ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* THÊM DÒNG NÀY ĐỂ RENDER CÁC TRANG CON VÀ TRUYỀN DỮ LIỆU ĐƠN HÀNG */}
                <Outlet context={{ orders, fetchOrders }} />
            </div>
            
        </div>
    );
}

export default Profile;