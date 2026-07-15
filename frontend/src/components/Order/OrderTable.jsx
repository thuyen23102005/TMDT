function OrderTable({ orders, onDetail, onUpdate }) {

    return (

        <table className="table table-bordered table-hover align-middle">

            <thead className="table-success text-center">

                <tr>

                    <th width="180">Khách hàng</th>

                    <th width="180">Người nhận</th>

                    <th width="130">SĐT</th>

                    <th>Địa chỉ nhận</th>

                    <th width="120">Ngày đặt</th>

                    <th width="120">Tổng tiền</th>

                    <th width="150">Thanh toán</th>

                    <th width="160">Trạng thái</th>

                    <th width="180">Thao tác</th>

                </tr>

            </thead>

            <tbody>

                {
                    orders.length === 0 ? (

                        <tr>

                            <td colSpan="9" className="text-center py-4">
                                Chưa có đơn hàng.
                            </td>

                        </tr>

                    ) : (

                        orders.map(order => (

                            <tr key={order.MaDH}>

                                <td>

                                    <strong>{order.TenKhachHang}</strong>

                                </td>

                                <td>{order.NguoiNhan}</td>

                                <td>{order.SoDienThoai}</td>

                                <td
                                    style={{
                                        maxWidth: "280px",
                                        whiteSpace: "normal"
                                    }}
                                >
                                    {order.DiaChiChiTiet}
                                </td>

                                <td>

                                    {new Date(order.NgayDat).toLocaleDateString("vi-VN")}

                                </td>

                                <td className="fw-bold text-danger">

                                    {Number(order.TongTien).toLocaleString()} đ

                                </td>

                                <td>

                                    <span
                                        className={`badge ${
                                            order.TrangThaiThanhToan === "Đã thanh toán"
                                                ? "bg-success"
                                                : "bg-warning text-dark"
                                        }`}
                                    >
                                        {order.TrangThaiThanhToan}
                                    </span>

                                </td>

                                <td>

                                    <span
                                        className={`badge
                                            ${
                                                order.TrangThaiDonHang === "Chờ xác nhận"
                                                    ? "bg-secondary"
                                                : order.TrangThaiDonHang === "Đã xác nhận"
                                                    ? "bg-primary"
                                                : order.TrangThaiDonHang === "Đang giao"
                                                    ? "bg-warning text-dark"
                                                : order.TrangThaiDonHang === "Đã giao"
                                                    ? "bg-success"
                                                : "bg-danger"
                                            }
                                        `}
                                    >
                                        {order.TrangThaiDonHang}
                                    </span>

                                </td>

                                <td>

                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        onClick={() => onDetail(order.MaDH)}
                                    >
                                        Chi tiết
                                    </button>

                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => onUpdate(order)}
                                    >
                                        Cập nhật
                                    </button>

                                </td>

                            </tr>

                        ))

                    )
                }

            </tbody>

        </table>

    );

}

export default OrderTable;