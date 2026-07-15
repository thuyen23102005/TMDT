import { useOutletContext } from "react-router-dom";

function DonHang() {
    const { orders } = useOutletContext();

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
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.MaDH}>
                                    <td className="fw-bold text-secondary">#{o.MaDH}</td>
                                    <td>{new Date(o.NgayDat).toLocaleDateString('vi-VN')}</td>
                                    <td className="text-danger fw-bold">{Number(o.TongTien).toLocaleString()} đ</td>
                                    <td>
                                        <span className={`badge ${o.TrangThaiDonHang === 'Đã giao' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {o.TrangThaiDonHang}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${o.TrangThaiThanhToan === 'Đã thanh toán' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                            {o.TrangThaiThanhToan}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DonHang;