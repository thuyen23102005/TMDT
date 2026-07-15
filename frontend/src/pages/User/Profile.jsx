import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Profile() {
    const location = useLocation();
    const isOrdersTab = location.pathname.includes('don-hang');
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage để hiển thị tên
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        // BỎ điều kiện isOrdersTab để luôn luôn gọi API lấy đơn hàng khi vào Profile
        // Mục đích: Tính toán thành tích (Số đơn, Tổng tiền) cho tất cả các tab
        if (storedUser) {
            fetch(`http://localhost:5000/api/orders/user/${storedUser.maTK}`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error("Lỗi kéo đơn hàng:", err));
        }
    }, [location.pathname]); // Cập nhật lại mỗi khi chuyển tab trong profile để data luôn mới

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
                                    {/* CẬP NHẬT: Hiện số lượng đơn hàng thật */}
                                    <div className="fw-bold">{totalOrders} đơn hàng</div>
                                </div>
                                <div>
                                    <div className="text-muted small">Đã thanh toán</div>
                                    {/* CẬP NHẬT: Hiện tổng tiền thật đã chi */}
                                    <div className="fw-bold text-success">{totalSpent.toLocaleString()} đ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KIỂM TRA: NẾU BẤM VÀO TAB "ĐƠN HÀNG" THÌ HIỆN DANH SÁCH, KHÔNG THÌ HIỆN OUTLET CŨ */}
                {isOrdersTab ? (
                    <div className="shadow-sm rounded p-3 bg-white mt-3 border">
                        <h5 className="fw-bold mb-3 text-success">Đơn hàng của tôi</h5>
                        {orders.length === 0 ? (
                            <div className="text-center text-muted py-4">Chưa có đơn hàng nào. Hãy mua sắm thêm nhé!</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Ngày đặt</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thanh toán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.MaDH}>
                                                <td className="fw-bold text-secondary">#{o.MaDH}</td>
                                                <td>{new Date(o.NgayDat).toLocaleDateString('vi-VN')}</td>
                                                <td className="text-danger fw-bold">{Number(o.TongTien).toLocaleString()} đ</td>
                                                <td><span className={`badge ${o.TrangThaiDonHang === 'Đã giao' ? 'bg-success' : 'bg-warning text-dark'}`}>{o.TrangThaiDonHang}</span></td>
                                                <td><span className={`badge ${o.TrangThaiThanhToan === 'Đã thanh toán' ? 'bg-info text-dark' : 'bg-secondary'}`}>{o.TrangThaiThanhToan}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
}

export default Profile;