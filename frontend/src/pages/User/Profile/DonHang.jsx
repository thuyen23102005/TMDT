import { useOutletContext } from "react-router-dom";
import { useState } from "react";

function DonHang() {
    const { orders, fetchOrders } = useOutletContext();
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewItems, setReviewItems] = useState([]);
    const [reviewData, setReviewData] = useState({});
    const [currentReviewOrderId, setCurrentReviewOrderId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailItems, setDetailItems] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // Lấy thông tin user hiện tại để gửi kèm đánh giá
    const user = JSON.parse(localStorage.getItem("user"));

    const ordersPerPage = 5;

    const handleCancelOrder = async (maDH) => {

        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?"))
            return;

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/orders/${maDH}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        TrangThaiDonHang: "Đã hủy",
                    }),
                }
            );

            if (response.ok) {

                alert("Hủy đơn hàng thành công!");

                fetchOrders();

            } else {

                alert("Có lỗi xảy ra khi hủy đơn.");

            }

        } catch (error) {

            console.error(error);

            alert("Lỗi kết nối máy chủ.");

        }

    };

    const handleOpenDetail = async (order) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.MaDH}`);
            const data = await res.json();
            setDetailItems(data.items);   // <-- sửa dòng này
            setSelectedOrder(data.order); // <-- nên sửa luôn
            setShowDetailModal(true);
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng", error);
        }
    };

    const handleOpenReview = async (maDH) => {
        try {
            setCurrentReviewOrderId(maDH); // Lưu lại mã đơn đang đánh giá
            
            const resOrder = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${maDH}`);
            const orderData = await resOrder.json();
            const orderItems = orderData.items;
            
            const resReview = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/user/${user.maTK}`);
            const reviewedData = await resReview.json();
            
            // CHỈ lọc những đánh giá thuộc về CÙNG MỘT ĐƠN HÀNG (MaDH) này
            const reviewedProductIdsInThisOrder = reviewedData
                .filter(r => r.MaDH === maDH)
                .map(r => r.MaSP);
            
            // Giữ lại các món chưa đánh giá trong đơn này
            const unreviewedItems = orderItems.filter(item => !reviewedProductIdsInThisOrder.includes(item.MaSP));
            
            if (unreviewedItems.length === 0) {
                alert("Cảm ơn bạn! Bạn đã hoàn tất đánh giá cho tất cả sản phẩm trong đơn hàng này.");
                return; 
            }

            setReviewItems(unreviewedItems);
            
            const initialReviewData = {};
            unreviewedItems.forEach(item => {
                initialReviewData[item.MaSP] = { soSao: 5, noiDung: '' };
            });
            setReviewData(initialReviewData);
            setShowReviewModal(true);
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng", error);
        }

        setReviewItems(unreviewedItems);
        
        const initialReviewData = {};
        unreviewedItems.forEach(item => {
            initialReviewData[item.MaSP] = { soSao: 5, noiDung: '' };
        });
        setReviewData(initialReviewData);
        setShowReviewModal(true);
    } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng", error);
    }
};

    const submitReview = async (maSP) => {
        const { soSao, noiDung } = reviewData[maSP];
        if (!noiDung.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maTK: user.maTK,
                    maSP: maSP,
                    maDH: currentReviewOrderId, // Gửi kèm mã đơn hàng
                    soSao: soSao,
                    noiDung: noiDung
                })
            });
            
            if (res.ok) {
                alert("Đánh giá thành công!");
                fetchOrders();
                
                window.dispatchEvent(new Event('updateNotificationCount'));
                setReviewItems(prev => {
                    const remainingItems = prev.filter(item => item.MaSP !== maSP);
                    if (remainingItems.length === 0) {
                        setShowReviewModal(false); 
                    }
                    return remainingItems;
                });
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Có lỗi xảy ra");
            }
        } catch(error) {
            console.error("LỖI ĐÁNH GIÁ:", error);
            alert("Lỗi kết nối máy chủ");
        }
    };

    //============================
    // LỌC ĐƠN
    //============================

    const filteredOrders = orders.filter((o) => {

        switch (filter) {

            case "cancelled":
                return o.TrangThaiDonHang === "Đã hủy";

            case "active":
                return o.TrangThaiDonHang !== "Đã hủy";

            case "paid":
                return o.TrangThaiThanhToan === "Đã thanh toán";

            case "unpaid":
                return o.TrangThaiThanhToan !== "Đã thanh toán";

            default:
                return true;
        }

    });

    //============================
    // PHÂN TRANG
    //============================

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const indexOfLastOrder = currentPage * ordersPerPage;

    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

    const currentOrders = filteredOrders.slice(
        indexOfFirstOrder,
        indexOfLastOrder
    );

    return (

        <div className="shadow-sm rounded p-3 bg-white mt-3 border">

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h5 className="fw-bold text-success mb-0">

                    Đơn hàng của bạn

                </h5>

                <select
                    className="form-select w-auto"
                    value={filter}
                    onChange={(e) => {

                        setFilter(e.target.value);

                        setCurrentPage(1);

                    }}
                >
                    <option value="all">Tất cả</option>

                    <option value="active">
                        Chưa hủy
                    </option>

                    <option value="cancelled">
                        Đã hủy
                    </option>

                    <option value="paid">
                        Đã thanh toán
                    </option>

                    <option value="unpaid">
                        Chưa thanh toán
                    </option>

                </select>

            </div>

            {filteredOrders.length === 0 ? (

                <div className="text-center text-muted py-4">

                    Không có đơn hàng.

                </div>

            ) : (

                <>
                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th>Ngày đặt</th>

                                    <th>Tổng tiền</th>

                                    <th>Trạng thái</th>

                                    <th>Thanh toán</th>

                                    <th>Thao tác</th>

                                </tr>

                            </thead>

                            <tbody>

                                {currentOrders.map((o) => {

                                    const canCancel =
                                        o.TrangThaiThanhToan !== "Đã thanh toán" &&
                                        o.TrangThaiDonHang !== "Đang giao" &&
                                        o.TrangThaiDonHang !== "Đã giao" &&
                                        o.TrangThaiDonHang !== "Đã hủy";

                                    return (

                                        <tr key={o.MaDH}>

                                            <td>
                                                {new Date(
                                                    o.NgayDat
                                                ).toLocaleDateString("vi-VN")}
                                            </td>

                                            <td className="text-danger fw-bold">
                                                {Number(
                                                    o.TongTien
                                                ).toLocaleString()} đ
                                            </td>

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        o.TrangThaiDonHang ===
                                                        "Đã giao"
                                                            ? "bg-success"
                                                            : o.TrangThaiDonHang ===
                                                              "Đã hủy"
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
                                                        o.TrangThaiThanhToan ===
                                                        "Đã thanh toán"
                                                            ? "bg-info text-dark"
                                                            : "bg-secondary"
                                                    }`}
                                                >

                                                    {o.TrangThaiThanhToan}

                                                </span>

                                            </td>

                                            <td>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button
                                                        className="btn btn-outline-info btn-sm"
                                                        onClick={() => handleOpenDetail(o)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                    
                                                    {o.TrangThaiDonHang === "Đã giao" && (
                                                        o.TongSoMon > 0 && o.TongSoMon === o.SoMonDaDanhGia ? (
                                                            <button className="btn btn-secondary btn-sm" disabled style={{ cursor: 'not-allowed' }}>
                                                                Đã đánh giá
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => handleOpenReview(o.MaDH)}
                                                            >
                                                                {o.SoMonDaDanhGia > 0 ? "Đánh giá tiếp" : "Đánh giá"}
                                                            </button>
                                                        )
                                                    )}
                                                    
                                                    {canCancel && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleCancelOrder(o.MaDH)}
                                                        >
                                                            Hủy đơn
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                    {/* PHÂN TRANG */}

                    {totalPages > 1 && (

                        <div className="d-flex justify-content-center mt-3">

                            <nav>

                                <ul className="pagination">

                                    <li
                                        className={`page-item ${
                                            currentPage === 1
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage - 1
                                                )
                                            }
                                        >
                                            «
                                        </button>
                                    </li>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => (

                                            <li
                                                key={i}
                                                className={`page-item ${
                                                    currentPage === i + 1
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >

                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        setCurrentPage(i + 1)
                                                    }
                                                >
                                                    {i + 1}
                                                </button>

                                            </li>

                                        )
                                    )}

                                    <li
                                        className={`page-item ${
                                            currentPage === totalPages
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >

                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                setCurrentPage(
                                                    currentPage + 1
                                                )
                                            }
                                        >
                                            »
                                        </button>

                                    </li>

                                </ul>

                            </nav>

                        </div>

                    )}

                </>

            )}

            {/* MODAL ĐÁNH GIÁ SẢN PHẨM */}
            {showReviewModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold text-success">Đánh giá sản phẩm</h5>
                                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {reviewItems.length === 0 ? (
                                    <p className="text-center text-muted">Bạn đã đánh giá hết sản phẩm trong đơn này.</p>
                                ) : (
                                    reviewItems.map(item => (
                                        <div key={item.MaSP} className="mb-4 border-bottom pb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <img 
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/${item.HinhAnh}`} 
                                                    alt={item.TenSP} 
                                                    style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
                                                    className="me-3 border rounded"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/60' }}
                                                />
                                                <h6 className="mb-0 fw-bold">{item.TenSP}</h6>
                                            </div>
                                            
                                            <div className="mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span 
                                                        key={star} 
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            color: star <= reviewData[item.MaSP]?.soSao ? '#ffc107' : '#e4e5e9', 
                                                            fontSize: '28px' 
                                                        }}
                                                        onClick={() => setReviewData({...reviewData, [item.MaSP]: {...reviewData[item.MaSP], soSao: star}})}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            <textarea 
                                                className="form-control mb-3" 
                                                rows="3"
                                                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                                                value={reviewData[item.MaSP]?.noiDung}
                                                onChange={(e) => setReviewData({...reviewData, [item.MaSP]: {...reviewData[item.MaSP], noiDung: e.target.value}})}
                                            />
                                            
                                            <div className="text-end">
                                                <button className="btn btn-success btn-sm px-4" onClick={() => submitReview(item.MaSP)}>
                                                    Gửi đánh giá
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {showDetailModal && selectedOrder && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold text-success">
                                    Chi tiết đơn hàng #{selectedOrder.MaDH}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="mb-4">
                                    <strong>Ngày đặt: </strong> {new Date(selectedOrder.NgayDat).toLocaleDateString("vi-VN")}<br/>
                                    <strong>Trạng thái: </strong> <span className="text-warning">{selectedOrder.TrangThaiDonHang}</span>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Đơn giá</th>
                                                <th>Số lượng</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailItems.map((item, index) => (
                                                <tr key={item.MaSP || index}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL}/uploads/${item.HinhAnh}`}
                                                                alt={item.TenSP}
                                                                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                                                className="me-2 border rounded bg-white"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                                                            />
                                                            <span className="fw-medium">{item.TenSP}</span>
                                                        </div>
                                                    </td>
                                                    <td>{Number(item.DonGia).toLocaleString()} đ</td>
                                                    <td className="text-center">{item.SoLuong}</td>
                                                    <td className="text-danger fw-bold">{Number(item.ThanhTien).toLocaleString()} đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-end mt-3">
                                    <div style={{ width: '300px' }}>
                                       <div className="d-flex justify-content-between mb-2">
                                            <span>Tổng tiền hàng:</span>
                                            <span>{Number((detailItems || []).reduce((acc, item) => acc + (item.ThanhTien || 0), 0)).toLocaleString()} đ</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Phí giao hàng:</span>
                                            <span>
                                                {Number(selectedOrder.TongTien - (detailItems || []).reduce((acc, item) => acc + (item.ThanhTien || 0), 0)).toLocaleString()} đ
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold fs-5 text-success border-top pt-2">
                                            <span>Tổng cộng:</span>
                                            <span>{Number(selectedOrder.TongTien).toLocaleString()} đ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );

}

export default DonHang;