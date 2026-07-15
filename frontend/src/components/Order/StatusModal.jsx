import { useEffect, useState } from "react";

function StatusModal({ order, onSave, onClose }) {
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (order) {
            setStatus(order.TrangThaiDonHang);
        }
    }, [order]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(order.MaDH, { TrangThaiDonHang: status });
    };

    if (!order) return null;

    // Lấy trạng thái hiện tại của đơn hàng từ props
    const currentStatus = order.TrangThaiDonHang;

    // Cấu hình các trạng thái tiếp theo được phép chọn
    const allowedTransitions = {
        "Chờ xác nhận": ["Chờ xác nhận", "Đã xác nhận", "Đã hủy"],
        "Đã xác nhận": ["Đã xác nhận", "Đang giao", "Đã hủy"],
        "Đang giao": ["Đang giao", "Đã giao", "Đã hủy"],
        "Đã giao": ["Đã giao"], // Trạng thái cuối
        "Đã hủy": ["Đã hủy"]    // Trạng thái cuối
    };

    // Lấy danh sách các trạng thái hợp lệ cho đơn hàng này
    const validOptions = allowedTransitions[currentStatus] || [currentStatus];

    // Kiểm tra xem đơn hàng đã ở trạng thái kết thúc chưa
    const isTerminalState = currentStatus === "Đã giao" || currentStatus === "Đã hủy";

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Cập nhật trạng thái đơn hàng</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {isTerminalState ? (
                                <div className="alert alert-warning">
                                    Đơn hàng này đang ở trạng thái <strong>{currentStatus}</strong> và không thể thay đổi.
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <label className="form-label">Chuyển sang trạng thái:</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        {validOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Đóng
                            </button>
                            {/* Ẩn nút Lưu nếu là trạng thái kết thúc */}
                            {!isTerminalState && (
                                <button type="submit" className="btn btn-primary">
                                    Lưu thay đổi
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StatusModal;