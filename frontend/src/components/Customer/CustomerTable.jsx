function CustomerTable({
    customers,
    onLock
}) {

    // Hàm tính điểm và xếp hạng dựa trên tổng tiền chi tiêu
    const getRankInfo = (tongTien) => {
        const diem = Math.floor((tongTien || 0) / 500);
        let hang = "Đồng";
        
        if (diem >= 10000) hang = "Kim Cương";
        else if (diem >= 5000) hang = "Vàng";
        else if (diem >= 1000) hang = "Bạc";
        
        return { diem, hang };
    };

    return (

        <table className="table table-bordered table-hover">

            <thead className="table-success">

                <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Hạng</th>
                    <th>Điểm</th>
                    <th>Trạng thái</th>
                    <th width="180">
                        Thao tác
                    </th>
                </tr>

            </thead>

            <tbody>

                {
                    customers.map(customer => {
                        // Gọi hàm để tính toán điểm và hạng cho từng khách hàng
                        const { diem, hang } = getRankInfo(customer.TongTienDaChi);

                        return (
                            <tr key={customer.MaKH}>

                                <td>{customer.HoTen}</td>

                                <td>{customer.Email}</td>

                                <td>{customer.SoDienThoai}</td>

                                {/* Hiển thị Hạng và Điểm tự động tính */}
                                <td className="fw-bold">{hang}</td>

                                <td>{diem.toLocaleString()}</td>

                                <td>
                                    {
                                        customer.TrangThai
                                            ? <span className="badge bg-success">Hoạt động</span>
                                            : <span className="badge bg-danger">Đã khóa</span>
                                    }
                                </td>

                                <td>
                                    <button
                                        className={`btn btn-sm ${
                                            customer.TrangThai
                                                ? "btn-danger"
                                                : "btn-success"
                                        }`}
                                        onClick={() => onLock(customer)}
                                    >
                                        {
                                            customer.TrangThai
                                                ? "Khóa"
                                                : "Mở khóa"
                                        }
                                    </button>
                                </td>

                            </tr>
                        );
                    })
                }

            </tbody>

        </table>

    );

}

export default CustomerTable;