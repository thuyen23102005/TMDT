function OrderTable({ orders,onDetail }) {

    return (

        <table className="table table-bordered table-hover">

            <thead className="table-success">

                <tr>

                    <th>Mã đơn</th>

                    <th>Khách hàng</th>

                    <th>Ngày đặt</th>

                    <th>Tổng tiền</th>

                    <th>Thanh toán</th>

                    <th>Trạng thái</th>

                    <th width="170">Thao tác</th>

                </tr>

            </thead>

            <tbody>

                {
                    orders.map(order => (

                        <tr key={order.MaDH}>

                            <td>{order.MaDH}</td>

                            <td>{order.HoTen}</td>

                            <td>
                                {new Date(order.NgayDat).toLocaleDateString()}
                            </td>

                            <td>
                                {Number(order.TongTien).toLocaleString()} đ
                            </td>

                            <td>{order.TrangThaiThanhToan}</td>

                            <td>{order.TrangThaiDonHang}</td>

                            <td>

                                <button
                                    className="btn btn-info btn-sm me-2"
                                    onClick={() => onDetail(order.MaDH)}
                                >
                                    Chi tiết
                                </button>

                                <button
                                    className="btn btn-warning btn-sm"
                                >
                                    Cập nhật
                                </button>

                            </td>

                        </tr>

                    ))
                }

            </tbody>

        </table>

    );

}

export default OrderTable;