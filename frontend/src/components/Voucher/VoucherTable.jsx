import { useState, useEffect } from "react";

function VoucherTable({
    vouchers,
    onEdit,
    onDelete
}) {
    // ===========================
    // STATE PHÂN TRANG
    // ===========================
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(vouchers.length / itemsPerPage);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [vouchers.length, currentPage, totalPages]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVouchers = vouchers.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getStatus = (voucher) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(voucher.NgayBD);
        const end = new Date(voucher.NgayKT);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (today < start) {
            return {
                text: "Sắp diễn ra",
                className: "bg-warning text-dark"
            };
        }

        if (today > end || Number(voucher.SoLuong) <= 0) {
            return {
                text: "Đã hết hạn",
                className: "bg-danger"
            };
        }

        return {
            text: "Đang hoạt động",
            className: "bg-success"
        };
    };

    return (
        <div>
            <table className="table table-bordered table-hover">
                <thead className="table-success">
                    <tr>
                        <th>Code</th>
                        <th>Loại giảm</th>
                        <th>Loại Voucher</th> {/* CỘT MỚI THÊM */}
                        <th>Giá trị</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Điều kiện</th>
                        <th>Số lượng</th>
                        <th>Điểm đổi</th>
                        <th>Trạng thái</th>
                        <th width="180">Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {currentVouchers.map(voucher => {
                        const status = getStatus(voucher);

                        return (
                            <tr key={voucher.MaGG}>
                                <td>{voucher.Code}</td>
                                
                                <td>{voucher.LoaiGiam}</td>
                                
                                {/* HIỂN THỊ DỮ LIỆU CỘT MỚI */}
                                <td>
                                    <span className={`badge ${
                                        voucher.LoaiVoucher === 'Đổi điểm' ? 'bg-info' : 
                                        voucher.LoaiVoucher === 'Hạng' ? 'bg-primary' : 'bg-secondary'
                                    }`}>
                                        {voucher.LoaiVoucher || 'Bình thường'}
                                    </span>
                                </td>

                                <td>
                                    {voucher.LoaiGiam === "Phần trăm"
                                        ? `${voucher.GiaTriGiam}%`
                                        : Number(voucher.GiaTriGiam).toLocaleString() + " đ"}
                                </td>

                                <td>{voucher.NgayBD?.slice(0, 10)}</td>

                                <td>{voucher.NgayKT?.slice(0, 10)}</td>

                                <td>
                                    {Number(voucher.DieuKienApDung).toLocaleString()} đ
                                </td>

                                <td>{voucher.SoLuong}</td>

                                <td>
                                    {voucher.SoDiemDoi == null
                                        ? "Không áp dụng"
                                        : `${voucher.SoDiemDoi} điểm`}
                                </td>

                                <td>
                                    <span className={`badge ${status.className}`}>
                                        {status.text}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        disabled={status.text === "Đã hết hạn"}
                                        onClick={() => onEdit(voucher)}
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => onDelete(voucher.MaGG)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {totalPages > 1 && (
                <nav className="mt-3">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                «
                            </button>
                        </li>
                        
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <li 
                                    key={pageNumber} 
                                    className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                >
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                </li>
                            );
                        })}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                »
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default VoucherTable;