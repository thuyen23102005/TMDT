const { connectDB, sql } = require("../config/db");

const getAllCustomers = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            kh.MaKH,
            kh.HoTen,
            kh.GioiTinh,
            kh.NgaySinh,
            kh.DiaChi,
            tk.Email,
            tk.SoDienThoai,
            tk.TrangThai,
            ISNULL(SUM(dh.TongTien), 0) AS TongTienDaChi
        FROM KhachHang kh
        INNER JOIN TaiKhoan tk
            ON kh.MaTK = tk.MaTK
        LEFT JOIN DonHang dh 
            ON kh.MaKH = dh.MaKH AND dh.TrangThaiThanhToan = N'Đã thanh toán'
        GROUP BY 
            kh.MaKH, kh.HoTen, kh.GioiTinh, kh.NgaySinh, kh.DiaChi, tk.Email, tk.SoDienThoai, tk.TrangThai
        ORDER BY kh.MaKH
    `);

    return result.recordset;

};

const updateStatus = async (id, status) => {

    const pool = await connectDB();

    await pool.request()
        .input("MaKH", sql.Int, id)
        .input("TrangThai", sql.Bit, status)
        .query(`
            UPDATE TaiKhoan
            SET TrangThai = @TrangThai
            WHERE MaTK = (
                SELECT MaTK
                FROM KhachHang
                WHERE MaKH = @MaKH
            )
        `);

};

module.exports = {
    getAllCustomers,
    updateStatus
};