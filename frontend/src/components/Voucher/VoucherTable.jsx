function VoucherTable({
    vouchers,
    onEdit,
    onDelete
}) {

    return (

        <table className="table table-bordered">

            <thead className="table-success">

                <tr>

                    <th>Code</th>

                    <th>Loại</th>

                    <th>Giá trị</th>

                    <th>Bắt đầu</th>

                    <th>Kết thúc</th>

                    <th>Điều kiện</th>

                    <th>Số lượng</th>

                    <th width="180">
                        Thao tác
                    </th>

                </tr>

            </thead>

            <tbody>

                {
                    vouchers.map(voucher => (

                        <tr key={voucher.MaGG}>

                            <td>{voucher.Code}</td>

                            <td>{voucher.LoaiGiam}</td>

                            <td>{voucher.GiaTriGiam}</td>

                            <td>{voucher.NgayBD?.slice(0,10)}</td>

                            <td>{voucher.NgayKT?.slice(0,10)}</td>

                            <td>{voucher.DieuKienApDung}</td>

                            <td>{voucher.SoLuong}</td>

                            <td>

                                <button
                                    className="btn btn-warning btn-sm me-2"
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

                    ))
                }

            </tbody>

        </table>

    );

}

export default VoucherTable;