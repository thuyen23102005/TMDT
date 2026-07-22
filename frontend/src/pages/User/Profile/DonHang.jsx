import { useOutletContext } from "react-router-dom";

function DonHang() {
    // Nhận thêm hàm fetchOrders từ Profile truyền xuống
    const { orders, fetchOrders } = useOutletContext();

    // Hàm xử lý khi bấm nút Hủy
    const handleCancelOrder = async (maDH) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/${maDH}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ TrangThaiDonHang: 'Đã hủy' })
                });

                if (response.ok) {
                    alert("Hủy đơn hàng thành công!");
                    fetchOrders(); // Gọi hàm này để load lại danh sách đơn hàng mới nhất
                } else {
                    alert("Có lỗi xảy ra khi hủy đơn.");
                }
            } catch (error) {
                console.error("Lỗi:", error);
                alert("Lỗi kết nối đến máy chủ.");
            }
        }
    };

    return (
        <div className="shadow-sm rounded p-3 bg-white mt-3 border">
            <h5 className="fw-bold mb-3 text-success">Đơn hàng của bạn</h5>
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
                                <th>Thao tác</th> {/* Thêm cột Thao tác */}
                            </tr>
                        </thead>
                            <tbody>
                            {orders.map(o => {

                                const canCancel =
                                    o.TrangThaiThanhToan !== "Đã thanh toán" &&
                                    o.TrangThaiDonHang !== "Đang giao" &&
                                    o.TrangThaiDonHang !== "Đã giao" &&
                                    o.TrangThaiDonHang !== "Đã hủy";

                                return (

                                    <tr key={o.MaDH}>

                                        <td className="fw-bold text-secondary">
                                            #{o.MaDH}
                                        </td>

                                        <td>
                                            {new Date(o.NgayDat).toLocaleDateString("vi-VN")}
                                        </td>

                                        <td className="text-danger fw-bold">
                                            {Number(o.TongTien).toLocaleString()} đ
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${
                                                    o.TrangThaiDonHang === "Đã giao"
                                                        ? "bg-success"
                                                        : o.TrangThaiDonHang === "Đã hủy"
                                                        ? "bg-danger"
                                                        : "bg-warning text-dark"
                                                }`}
                                            >
                                                {o.TrangThaiDonHang}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${
                                                    o.TrangThaiThanhToan === "Đã thanh toán"
                                                        ? "bg-info text-dark"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {o.TrangThaiThanhToan}
                                            </span>
                                        </td>

                                        <td>

                                            {canCancel ? (

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancelOrder(o.MaDH)}
                                                >
                                                    Hủy đơn
                                                </button>

                                            ) : (

                                                <span className="text-muted small">
                                                    Không thể hủy
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                );

                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DonHang;