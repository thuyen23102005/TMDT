import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrderDetail = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
                return res.json();
            })
            .then(data => {
                setOrderData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${id} này không?`)) {
            return;
        }

        setIsCancelling(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    TrangThaiDonHang: 'Đã hủy',
                    TrangThaiThanhToan: orderData.order.TrangThaiThanhToan
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Hủy đơn hàng thất bại!");
                setIsCancelling(false);
                return;
            }

            alert("Hủy đơn hàng thành công!");
            setIsCancelling(false);
            fetchOrderDetail();
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối máy chủ khi hủy đơn hàng!");
            setIsCancelling(false);
        }
    };

    if (isLoading) return <h3 className="state-message loading">Đang tải thông tin đơn hàng...</h3>;
    if (error || !orderData) return <h3 className="state-message error">❌ {error || "Đơn hàng không tồn tại"}</h3>;

    const { order, items } = orderData;

    const canCancel = (order.TrangThaiDonHang === 'Chờ xác nhận' || order.TrangThaiDonHang === 'Đã xác nhận') 
                      && order.TrangThaiThanhToan !== 'Đã thanh toán';

    return (
        <div className="order-detail-wrapper">
            <div className="order-detail-header">
                <h2 className="order-detail-title">Chi tiết đơn hàng #{order.MaDH}</h2>
                <span className={`order-status-badge ${order.TrangThaiDonHang === 'Đã hủy' ? 'cancelled' : 'normal'}`}>
                    {order.TrangThaiDonHang}
                </span>
            </div>

            {/* THÔNG TIN NGƯỜI NHẬN & ĐỊA CHỈ */}
            <div className="shipping-info-box">
                <h4 className="shipping-info-title">📍 Thông tin giao hàng</h4>
                <p className="shipping-info-row"><strong>Người nhận:</strong> {order.NguoiNhan || 'Khách vãng lai'}</p>
                <p className="shipping-info-row"><strong>Số điện thoại:</strong> {order.SoDienThoai}</p>
                <p className="shipping-info-row"><strong>Địa chỉ:</strong> {order.DiaChiChiTiet}</p>
                <p className="shipping-info-row">
                    <strong>Trạng thái thanh toán:</strong> {' '}
                    <span className={order.TrangThaiThanhToan === 'Đã thanh toán' ? 'payment-status-success' : 'payment-status-pending'}>
                        {order.TrangThaiThanhToan}
                    </span>
                </p>
            </div>

            {/* DANH SÁCH SẢN PHẨM */}
            <h4 className="section-title">🛒 Danh sách sản phẩm</h4>
            <table className="order-items-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Sản phẩm</th>
                        <th className="text-center">Đơn giá</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="product-col">
                                <img 
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${item.HinhAnh}`} 
                                    alt={item.TenSP} 
                                    className="product-img"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                                />
                                <strong className="product-name">{item.TenSP}</strong>
                            </td>
                            <td className="text-center">{Number(item.DonGia).toLocaleString()} đ</td>
                            <td className="text-center">{item.SoLuong}</td>
                            <td className="text-right" style={{ fontWeight: 'bold' }}>{Number(item.ThanhTien).toLocaleString()} đ</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* TỔNG TIỀN VÀ NÚT THAO TÁC */}
            <div className="order-summary-footer">
                <div className="text-right">
                    <p className="shipping-fee-text">Phí vận chuyển: <strong>{Number(order.PhiVanChuyen).toLocaleString()} đ</strong></p>
                    <h3 className="total-amount-text">Tổng thanh toán: {Number(order.TongTien).toLocaleString()} đ</h3>
                </div>

                <div className="action-row">
                    <Link to="/" className="back-link">
                        &larr; Tiếp tục mua sắm
                    </Link>

                    {canCancel && (
                        <button
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                            className="btn-cancel-order"
                        >
                            {isCancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;