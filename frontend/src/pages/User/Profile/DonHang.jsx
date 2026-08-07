import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import "./DonHang.css";

// Hạn đổi trả mặc định (số ngày) khi sản phẩm chưa được gán danh mục
// hoặc danh mục chưa cấu hình SoNgayDoiTra trong bảng DanhMuc.
const HAN_DOI_TRA_MAC_DINH = 7;

const LY_DO_OPTIONS = [
    { value: "rach_bao_bi", label: "Sản phẩm bị rách bao bì" },
    { value: "hu_hong", label: "Bị hư hỏng do vi khuẩn / côn trùng" },
    { value: "hong_van_chuyen", label: "Hư hỏng trong quá trình vận chuyển" },
    { value: "het_han", label: "Sản phẩm hết hạn sử dụng" },
    { value: "sai_hang", label: "Giao sai hàng" },
];

const TRANG_THAI_BADGE = {
    "Chờ duyệt": "status-pending",
    "Đã duyệt": "status-paid",
    "Từ chối": "status-cancel",
    "Hoàn thành": "status-done",
};

function getReturnDeadline(order) {
    // Ưu tiên ngày giao thực tế, fallback về ngày đặt nếu backend chưa có NgayGiao
    const baseDate = order.NgayGiao || order.NgayDat;
    if (!baseDate) return null;
    // Ở list view chưa tải chi tiết sản phẩm nên chưa biết SoNgayDoiTra chính xác từng món.
    // Dùng hạn mặc định (xa nhất) để quyết định có hiện nút hay không; hạn thật của từng
    // sản phẩm sẽ được kiểm tra lại chính xác khi mở modal (xem getItemDeadline).
    const deadline = new Date(baseDate);
    deadline.setDate(deadline.getDate() + HAN_DOI_TRA_MAC_DINH);
    return deadline;
}

function getItemDeadline(order, item) {
    const baseDate = order.NgayGiao || order.NgayDat;
    if (!baseDate) return null;
    // SoNgayDoiTra lấy từ bảng DanhMuc (join qua SanPham.MaDM), trả về từ API chi tiết đơn hàng.
    const soNgay = item?.SoNgayDoiTra ?? HAN_DOI_TRA_MAC_DINH;
    const deadline = new Date(baseDate);
    deadline.setDate(deadline.getDate() + soNgay);
    return deadline;
}

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

    // --- State cho chức năng đổi/trả ---
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnOrder, setReturnOrder] = useState(null);
    const [returnItems, setReturnItems] = useState([]); // items của đơn đang mở modal
    const [selectedReturnItems, setSelectedReturnItems] = useState({}); // { MaSP: { checked, lyDo, moTa, anh: File[] } }
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const [returnRequests, setReturnRequests] = useState([]); // toàn bộ yêu cầu đổi trả của user, để hiện trạng thái theo MaDH

    const user = JSON.parse(localStorage.getItem("user"));
    const ordersPerPage = 5;

    useEffect(() => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/return-requests/user/${user.maTK}`)
            .then((res) => res.json())
            .then((data) => setReturnRequests(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Lỗi lấy yêu cầu đổi trả:", err));
    }, []);

    const getReturnRequestForOrder = (maDH) =>
        returnRequests.find((r) => r.MaDH === maDH);

    const handleCancelOrder = async (maDH) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?"))
            return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/orders/${maDH}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ TrangThaiDonHang: "Đã hủy" }),
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
            setDetailItems(data.items);
            setSelectedOrder(data.order);
            setShowDetailModal(true);
        } catch (error) {
            console.error("Lỗi lấy chi tiết đơn hàng", error);
        }
    };

    const handleOpenReview = async (maDH) => {
        try {
            setCurrentReviewOrderId(maDH);
            const resOrder = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${maDH}`);
            const orderData = await resOrder.json();
            const orderItems = orderData.items;

            const resReview = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/user/${user.maTK}`);
            const reviewedData = await resReview.json();

            const reviewedProductIdsInThisOrder = reviewedData
                .filter((r) => r.MaDH === maDH)
                .map((r) => r.MaSP);

            const unreviewedItems = orderItems.filter(
                (item) => !reviewedProductIdsInThisOrder.includes(item.MaSP)
            );

            if (unreviewedItems.length === 0) {
                alert("Cảm ơn bạn! Bạn đã hoàn tất đánh giá cho tất cả sản phẩm trong đơn hàng này.");
                return;
            }

            setReviewItems(unreviewedItems);
            const initialReviewData = {};
            unreviewedItems.forEach((item) => {
                initialReviewData[item.MaSP] = { soSao: 5, noiDung: "" };
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    maTK: user.maTK,
                    maSP: maSP,
                    maDH: currentReviewOrderId,
                    soSao: soSao,
                    noiDung: noiDung,
                }),
            });

            if (res.ok) {
                alert("Đánh giá thành công!");
                fetchOrders();
                window.dispatchEvent(new Event("updateNotificationCount"));
                setReviewItems((prev) => {
                    const remainingItems = prev.filter((item) => item.MaSP !== maSP);
                    if (remainingItems.length === 0) {
                        setShowReviewModal(false);
                    }
                    return remainingItems;
                });
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("LỖI ĐÁNH GIÁ:", error);
            alert("Lỗi kết nối máy chủ");
        }
    };

    // ============================
    // YÊU CẦU ĐỔI / TRẢ
    // ============================

    const handleOpenReturn = async (order) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.MaDH}`);
            const data = await res.json();
            setReturnOrder({ ...order, ...data.order });
            setReturnItems(data.items || []);

            const initial = {};
            (data.items || []).forEach((item) => {
                initial[item.MaSP] = { checked: false, lyDo: LY_DO_OPTIONS[0].value, moTa: "", anh: [] };
            });
            setSelectedReturnItems(initial);
            setShowReturnModal(true);
        } catch (error) {
            console.error("Lỗi mở form đổi trả:", error);
            alert("Không tải được thông tin đơn hàng.");
        }
    };

    const toggleReturnItem = (maSP) => {
        setSelectedReturnItems((prev) => ({
            ...prev,
            [maSP]: { ...prev[maSP], checked: !prev[maSP].checked },
        }));
    };

    const updateReturnItemField = (maSP, field, value) => {
        setSelectedReturnItems((prev) => ({
            ...prev,
            [maSP]: { ...prev[maSP], [field]: value },
        }));
    };

    const addReturnItemFiles = (maSP, newFiles) => {
        setSelectedReturnItems((prev) => {
            const existing = prev[maSP]?.anh || [];
            return {
                ...prev,
                [maSP]: { ...prev[maSP], anh: [...existing, ...newFiles] },
            };
        });
    };

    const removeReturnItemFile = (maSP, index) => {
        setSelectedReturnItems((prev) => {
            const existing = prev[maSP]?.anh || [];
            return {
                ...prev,
                [maSP]: { ...prev[maSP], anh: existing.filter((_, i) => i !== index) },
            };
        });
    };

    const handleSubmitReturn = async () => {
        const chosenItems = Object.entries(selectedReturnItems).filter(([, v]) => v.checked);

        if (chosenItems.length === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm cần đổi/trả.");
            return;
        }

        // Kiểm tra hạn đổi trả theo từng sản phẩm đã chọn
        const quaHan = chosenItems.filter(([maSP]) => {
            const item = returnItems.find((i) => i.MaSP === maSP);
            const deadline = getItemDeadline(returnOrder, item);
            return deadline && new Date() > deadline;
        });
        if (quaHan.length > 0) {
            alert("Một số sản phẩm đã quá hạn đổi trả, vui lòng bỏ chọn để tiếp tục.");
            return;
        }

        setIsSubmittingReturn(true);
        try {
            const formData = new FormData();
            formData.append("maTK", user.maTK);
            formData.append("MaDH", returnOrder.MaDH);

            const items = chosenItems.map(([maSP, v]) => ({
                MaSP: maSP,
                lyDo: v.lyDo,
                moTa: v.moTa,
            }));
            formData.append("items", JSON.stringify(items));

            chosenItems.forEach(([maSP, v]) => {
                (v.anh || []).forEach((file) => {
                    formData.append(`anh_${maSP}`, file);
                });
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/return-requests`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("Đã gửi yêu cầu đổi/trả. Chúng tôi sẽ xem xét trong thời gian sớm nhất!");
                setShowReturnModal(false);
                const resList = await fetch(`${import.meta.env.VITE_API_URL}/api/return-requests/user/${user.maTK}`);
                const dataList = await resList.json();
                setReturnRequests(Array.isArray(dataList) ? dataList : []);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || "Gửi yêu cầu thất bại, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi gửi yêu cầu đổi trả:", error);
            alert("Lỗi kết nối máy chủ.");
        } finally {
            setIsSubmittingReturn(false);
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
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    return (
        <div className="order-panel shadow-sm rounded p-3 bg-white mt-3 border">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold order-panel-title mb-0">Đơn hàng của bạn</h5>

                <select
                    className="form-select order-filter-select w-auto"
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="all">Tất cả</option>
                    <option value="active">Chưa hủy</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="unpaid">Chưa thanh toán</option>
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center text-muted py-4">Không có đơn hàng.</div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table order-table align-middle mb-0">
                            <thead>
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

                                    const returnReq = getReturnRequestForOrder(o.MaDH);
                                    const deadline = getReturnDeadline(o);
                                    const canReturn =
                                        o.TrangThaiDonHang === "Đã giao" &&
                                        !returnReq &&
                                        deadline &&
                                        new Date() <= deadline;

                                    return (
                                        <tr key={o.MaDH}>
                                            <td className="order-date">
                                                {new Date(o.NgayDat).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="order-total">
                                                {Number(o.TongTien).toLocaleString()} đ
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-pill ${
                                                        o.TrangThaiDonHang === "Đã giao"
                                                            ? "status-done"
                                                            : o.TrangThaiDonHang === "Đã hủy"
                                                            ? "status-cancel"
                                                            : "status-pending"
                                                    }`}
                                                >
                                                    {o.TrangThaiDonHang}
                                                </span>
                                                {returnReq && (
                                                    <span
                                                        className={`status-pill ms-2 ${TRANG_THAI_BADGE[returnReq.TrangThai] || "status-pending"}`}
                                                    >
                                                        Đổi trả: {returnReq.TrangThai}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-pill ${
                                                        o.TrangThaiThanhToan === "Đã thanh toán"
                                                            ? "status-paid"
                                                            : "status-unpaid"
                                                    }`}
                                                >
                                                    {o.TrangThaiThanhToan}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="order-actions">
                                                    <button
                                                        className="btn-order btn-order-detail"
                                                        onClick={() => handleOpenDetail(o)}
                                                    >
                                                        Xem chi tiết
                                                    </button>

                                                    {o.TrangThaiDonHang === "Đã giao" &&
                                                        (o.TongSoMon > 0 && o.TongSoMon === o.SoMonDaDanhGia ? (
                                                            <button className="btn-order btn-order-reviewed" disabled>
                                                                Đã đánh giá
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-order btn-order-review"
                                                                onClick={() => handleOpenReview(o.MaDH)}
                                                            >
                                                                {o.SoMonDaDanhGia > 0 ? "Đánh giá tiếp" : "Đánh giá"}
                                                            </button>
                                                        ))}

                                                    {canReturn && (
                                                        <button
                                                            className="btn-order btn-order-return"
                                                            onClick={() => handleOpenReturn(o)}
                                                        >
                                                            Yêu cầu đổi/trả
                                                        </button>
                                                    )}

                                                    {canCancel && (
                                                        <button
                                                            className="btn-order btn-order-cancel"
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

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <nav>
                                <ul className="pagination order-pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            «
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li
                                            key={i}
                                            className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                        >
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage + 1)}
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
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content order-modal-content">
                            <div className="modal-header order-modal-header">
                                <h5 className="modal-title fw-bold">Đánh giá sản phẩm</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowReviewModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                                {reviewItems.length === 0 ? (
                                    <p className="text-center text-muted">
                                        Bạn đã đánh giá hết sản phẩm trong đơn này.
                                    </p>
                                ) : (
                                    reviewItems.map((item) => (
                                        <div key={item.MaSP} className="mb-4 border-bottom pb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/${item.HinhAnh}`}
                                                    alt={item.TenSP}
                                                    style={{ width: "60px", height: "60px", objectFit: "contain" }}
                                                    className="me-3 border rounded"
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/60";
                                                    }}
                                                />
                                                <h6 className="mb-0 fw-bold">{item.TenSP}</h6>
                                            </div>

                                            <div className="mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        style={{
                                                            cursor: "pointer",
                                                            color:
                                                                star <= reviewData[item.MaSP]?.soSao
                                                                    ? "#ffc107"
                                                                    : "#e4e5e9",
                                                            fontSize: "28px",
                                                        }}
                                                        onClick={() =>
                                                            setReviewData({
                                                                ...reviewData,
                                                                [item.MaSP]: {
                                                                    ...reviewData[item.MaSP],
                                                                    soSao: star,
                                                                },
                                                            })
                                                        }
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
                                                onChange={(e) =>
                                                    setReviewData({
                                                        ...reviewData,
                                                        [item.MaSP]: {
                                                            ...reviewData[item.MaSP],
                                                            noiDung: e.target.value,
                                                        },
                                                    })
                                                }
                                            />

                                            <div className="text-end">
                                                <button
                                                    className="btn-order btn-order-review px-4"
                                                    onClick={() => submitReview(item.MaSP)}
                                                >
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
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content order-modal-content">
                            <div className="modal-header order-modal-header">
                                <h5 className="modal-title fw-bold">
                                    Chi tiết đơn hàng #{selectedOrder.MaDH}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDetailModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <div className="mb-4">
                                    <strong>Ngày đặt: </strong>
                                    {new Date(selectedOrder.NgayDat).toLocaleDateString("vi-VN")}
                                    <br />
                                    <strong>Trạng thái: </strong>{" "}
                                    <span className="status-pill status-pending">
                                        {selectedOrder.TrangThaiDonHang}
                                    </span>
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
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    objectFit: "contain",
                                                                }}
                                                                className="me-2 border rounded bg-white"
                                                                onError={(e) => {
                                                                    e.target.src = "https://via.placeholder.com/50";
                                                                }}
                                                            />
                                                            <span className="fw-medium">{item.TenSP}</span>
                                                        </div>
                                                    </td>
                                                    <td>{Number(item.DonGia).toLocaleString()} đ</td>
                                                    <td className="text-center">{item.SoLuong}</td>
                                                    <td className="order-total">
                                                        {Number(item.ThanhTien).toLocaleString()} đ
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-end mt-3">
                                    <div style={{ width: "300px" }}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tổng tiền hàng:</span>
                                            <span>
                                                {Number(
                                                    (detailItems || []).reduce(
                                                        (acc, item) => acc + (item.ThanhTien || 0),
                                                        0
                                                    )
                                                ).toLocaleString()}{" "}
                                                đ
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Phí giao hàng:</span>
                                            <span>
                                                {Number(
                                                    selectedOrder.TongTien -
                                                        (detailItems || []).reduce(
                                                            (acc, item) => acc + (item.ThanhTien || 0),
                                                            0
                                                        )
                                                ).toLocaleString()}{" "}
                                                đ
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

            {/* MODAL YÊU CẦU ĐỔI / TRẢ */}
            {showReturnModal && returnOrder && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content order-modal-content">
                            <div className="modal-header order-modal-header">
                                <h5 className="modal-title fw-bold">
                                    Yêu cầu đổi/trả — Đơn #{returnOrder.MaDH}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowReturnModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <p className="order-modal-subtitle small mb-3">
                                    Chọn sản phẩm gặp vấn đề, nêu lý do và đính kèm ảnh để chúng tôi xử lý nhanh nhất.
                                </p>

                                {returnItems.map((item) => {
                                    const state = selectedReturnItems[item.MaSP] || {};
                                    const deadline = getItemDeadline(returnOrder, item);
                                    const quaHan = deadline && new Date() > deadline;
                                    const uploadInputId = `return-upload-${item.MaSP}`;

                                    return (
                                        <div
                                            key={item.MaSP}
                                            className={`return-item-card mb-3 ${state.checked ? "selected" : ""} ${quaHan ? "expired" : ""}`}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="return-item-checkbox"
                                                    checked={!!state.checked}
                                                    disabled={quaHan}
                                                    onChange={() => toggleReturnItem(item.MaSP)}
                                                />
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/${item.HinhAnh}`}
                                                    alt={item.TenSP}
                                                    className="return-item-thumb"
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/48";
                                                    }}
                                                />
                                                <div>
                                                    <div className="return-item-name">{item.TenSP}</div>
                                                    {quaHan && (
                                                        <div className="return-item-expired-note">
                                                            Đã quá hạn đổi trả cho sản phẩm này
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {state.checked && !quaHan && (
                                                <div className="mt-3" style={{ paddingLeft: "31px" }}>
                                                    <div className="mb-3">
                                                        <label className="return-field-label">Lý do</label>
                                                        <select
                                                            className="form-select form-select-sm return-select"
                                                            value={state.lyDo}
                                                            onChange={(e) =>
                                                                updateReturnItemField(item.MaSP, "lyDo", e.target.value)
                                                            }
                                                        >
                                                            {LY_DO_OPTIONS.map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="return-field-label">Mô tả thêm</label>
                                                        <textarea
                                                            className="form-control form-control-sm return-textarea"
                                                            rows="2"
                                                            placeholder="Mô tả tình trạng sản phẩm..."
                                                            value={state.moTa}
                                                            onChange={(e) =>
                                                                updateReturnItemField(item.MaSP, "moTa", e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="return-field-label">Ảnh minh chứng</label>

                                                        {/* Input file thật bị ẩn, thay bằng label bấm được để tránh
                                                            hiển thị "Choose Files / No file chosen" mặc định của trình duyệt */}
                                                        <input
                                                            id={uploadInputId}
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="return-upload-input"
                                                            onChange={(e) => {
                                                                addReturnItemFiles(
                                                                    item.MaSP,
                                                                    Array.from(e.target.files || [])
                                                                );
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                        <label htmlFor={uploadInputId} className="return-upload-dropzone">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                                                            </svg>
                                                            Thêm ảnh minh chứng
                                                        </label>

                                                        {(state.anh || []).length > 0 && (
                                                            <div className="return-thumb-list">
                                                                {state.anh.map((file, idx) => (
                                                                    <div className="return-thumb-item" key={idx}>
                                                                        <img
                                                                            src={URL.createObjectURL(file)}
                                                                            alt={`Ảnh minh chứng ${idx + 1}`}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="return-thumb-remove"
                                                                            onClick={() =>
                                                                                removeReturnItemFile(item.MaSP, idx)
                                                                            }
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="text-end return-modal-footer">
                                    <button
                                        className="btn-return-cancel me-2"
                                        onClick={() => setShowReturnModal(false)}
                                        disabled={isSubmittingReturn}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="btn-return-submit"
                                        onClick={handleSubmitReturn}
                                        disabled={isSubmittingReturn}
                                    >
                                        {isSubmittingReturn ? "Đang gửi..." : "Gửi yêu cầu"}
                                    </button>
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