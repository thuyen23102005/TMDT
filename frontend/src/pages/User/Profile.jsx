import { Link, Outlet } from "react-router-dom";

function Profile() {
    return (
        <div className="row">
            {/* Sidebar */}
            <div className="col-md-3 mb-4">
                <div className="shadow-sm rounded p-3 text-center mb-3">
                    <div
                        className="rounded-circle bg-secondary mx-auto mb-2"
                        style={{ width: "80px", height: "80px" }}
                    ></div>
                    <strong>Họ và tên</strong>
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
                            <Link to="/profile/don-hang" className="text-dark text-decoration-none">📄 Đơn hàng của tôi</Link>
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
                                    <div className="fw-bold">100.000.000</div>
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
                                    <div className="fw-bold">234 đơn hàng</div>
                                </div>
                                <div>
                                    <div className="text-muted small">Đã thanh toán</div>
                                    <div className="fw-bold">100.000.000 đ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Đây là chỗ nội dung tab con sẽ hiển thị */}
                <Outlet />
            </div>
        </div>
    );
}

export default Profile;