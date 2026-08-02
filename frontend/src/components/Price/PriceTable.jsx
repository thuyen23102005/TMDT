function PriceTable({ prices, onEdit }) {

    return (

        <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

                <thead className="table-success text-center">

                    <tr>

                        <th width="80">Mã SP</th>

                        <th>Tên sản phẩm</th>

                        <th width="170">Giá gốc</th>

                        <th width="170">Đơn giá</th>

                        <th width="130">Giảm tối đa</th>

                        <th width="120">Tự động</th>

                        <th width="120">Thao tác</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        prices.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="text-center py-4"
                                >
                                    Chưa có dữ liệu.
                                </td>

                            </tr>

                        ) : (

                            prices.map(product => (

                                <tr key={product.MaSP}>

                                    <td className="text-center">

                                        {product.MaSP}

                                    </td>

                                    <td>

                                        <strong>
                                            {product.TenSP}
                                        </strong>

                                    </td>

                                    <td className="text-end">

                                        <span className="fw-bold">

                                            {Number(product.GiaGoc).toLocaleString("vi-VN")} đ

                                        </span>

                                    </td>

                                    <td className="text-end">

                                        <span className="fw-bold text-danger">

                                            {Number(product.DonGia).toLocaleString("vi-VN")} đ

                                        </span>

                                    </td>

                                    <td className="text-center">

                                        <span className="badge bg-warning text-dark">

                                            {product.GiamToiDa}%

                                        </span>

                                    </td>

                                    <td className="text-center">

                                        {
                                            product.TuDongGiamGia ? (

                                                <span className="badge bg-success">

                                                    Bật

                                                </span>

                                            ) : (

                                                <span className="badge bg-secondary">

                                                    Tắt

                                                </span>

                                            )
                                        }

                                    </td>

                                    <td className="text-center">

                                        <button

                                            className="btn btn-warning btn-sm"

                                            onClick={() => onEdit(product)}

                                        >

                                            Sửa giá

                                        </button>

                                    </td>

                                </tr>

                            ))

                        )
                    }

                </tbody>

            </table>

        </div>

    );

}

export default PriceTable;