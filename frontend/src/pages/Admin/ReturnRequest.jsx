import { useEffect, useState } from "react";
import {
    getReturnRequests,
    getReturnRequestDetail,
    updateReturnRequestStatus,
} from "../../services/Admin/returnRequestApi";

const STATUS_MAP = {
    "Chờ duyệt": { className: "badge bg-warning text-dark" },
    "Đã duyệt": { className: "badge bg-info text-dark" },
    "Từ chối": { className: "badge bg-danger" },
    "Hoàn thành": { className: "badge bg-success" },
};

// Đường dẫn ảnh minh chứng - CHỈNH LẠI nếu backend serve static khác chỗ này
const IMAGE_BASE_URL = `${import.meta.env.VITE_API_URL}/uploads`;

function ReturnRequest() {
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");

    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [ghiChu, setGhiChu] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getReturnRequests();
            setAllRequests(res.data || []);
        } catch (err) {
            console.error("Lỗi khi tải yêu cầu đổi/trả:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Lọc phía client vì backend chưa hỗ trợ filter theo TrangThai
    const requests = statusFilter
        ? allRequests.filter((r) => r.TrangThai === statusFilter)
        : allRequests;

    const openDetail = async (maYC) => {
        try {
            const res = await getReturnRequestDetail(maYC);
            setSelected(res.data);
            setGhiChu(res.data?.GhiChuAdmin || "");
            setShowModal(true);
        } catch (err) {
            console.error("Lỗi khi tải chi tiết:", err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
        setGhiChu("");
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selected) return;
        setUpdating(true);
        try {
            await updateReturnRequestStatus(selected.MaYC, {
                TrangThai: newStatus,
                GhiChuAdmin: ghiChu,
            });
            closeModal();
            fetchRequests();
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            alert("Cập nhật trạng thái thất bại!");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Quản lý đổi/trả</h3>

                <select
                    className="form-select"
                    style={{ width: 200 }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Từ chối">Từ chối</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                </select>
            </div>

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-success">
                        <tr>
                            <th>Mã YC</th>
                            <th>Mã đơn hàng</th>
                            <th>Khách hàng</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted">
                                    Không có yêu cầu đổi/trả nào
                                </td>
                            </tr>
                        ) : (
                            requests.map((r) => (
                                <tr key={r.MaYC}>
                                    <td>#{r.MaYC}</td>
                                    <td>#{r.MaDH}</td>
                                    <td>
                                        {r.TenKhachHang}
                                        <br />
                                        <small className="text-muted">{r.Email}</small>
                                    </td>
                                    <td>
                                        <span className={STATUS_MAP[r.TrangThai]?.className || "badge bg-secondary"}>
                                            {r.TrangThai}
                                        </span>
                                    </td>
                                    <td>{r.NgayTao ? new Date(r.NgayTao).toLocaleDateString("vi-VN") : ""}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => openDetail(r.MaYC)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {showModal && selected && (
                <div
                    className="modal d-block"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                    onClick={closeModal}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết yêu cầu đổi/trả #{selected.MaYC}</h5>
                                <button className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Mã đơn hàng:</strong> #{selected.MaDH}</p>
                                <p><strong>Khách hàng:</strong> {selected.TenKhachHang}</p>
                                <p>
                                    <strong>Trạng thái hiện tại:</strong>{" "}
                                    <span className={STATUS_MAP[selected.TrangThai]?.className}>
                                        {selected.TrangThai}
                                    </span>
                                </p>

                                <hr />
                                <strong>Danh sách sản phẩm yêu cầu đổi/trả:</strong>

                                {(selected.items || []).map((item) => (
                                    <div key={item.MaCTYC} className="border rounded p-2 mt-2">
                                        <p className="mb-1"><strong>Sản phẩm:</strong> {item.TenSP}</p>
                                        <p className="mb-1"><strong>Lý do:</strong> {item.LyDo}</p>
                                        {item.MoTa && (
                                            <p className="mb-1"><strong>Mô tả:</strong> {item.MoTa}</p>
                                        )}
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {(item.Anh || []).length > 0 ? (
                                                item.Anh.map((filename, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={`${IMAGE_BASE_URL}/${filename}`}
                                                        alt={`minh-chung-${idx}`}
                                                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                                                    />
                                                ))
                                            ) : (
                                                <p className="text-muted mb-0">Không có ảnh</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-3">
                                    <label className="form-label"><strong>Ghi chú admin:</strong></label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={ghiChu}
                                        onChange={(e) => setGhiChu(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                {selected.TrangThai === "Chờ duyệt" && (
                                    <>
                                        <button
                                            className="btn btn-danger"
                                            disabled={updating}
                                            onClick={() => handleUpdateStatus("Từ chối")}
                                        >
                                            Từ chối
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            disabled={updating}
                                            onClick={() => handleUpdateStatus("Đã duyệt")}
                                        >
                                            Duyệt
                                        </button>
                                    </>
                                )}
                                {selected.TrangThai === "Đã duyệt" && (
                                    <button
                                        className="btn btn-primary"
                                        disabled={updating}
                                        onClick={() => handleUpdateStatus("Hoàn thành")}
                                    >
                                        Đánh dấu hoàn thành
                                    </button>
                                )}
                                <button className="btn btn-secondary" onClick={closeModal}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReturnRequest;