const { connectDB } = require("../config/db");

const getDashboard = async () => {

    const pool = await connectDB();

    // 1. Truy vấn các thống kê tổng quan hiện có
    const summaryResult = await pool.request().query(`
        SELECT
            (
                SELECT COUNT(*)
                FROM SanPham
                WHERE TrangThai = 1
            ) AS TongSanPham,

            (
                SELECT COUNT(*)
                FROM KhachHang
            ) AS TongKhachHang,

            (
                SELECT COUNT(*)
                FROM DonHang
            ) AS TongDonHang,

            (
                SELECT COUNT(*) AS TongMaGiamGia
                FROM MaGiamGia
                WHERE
                    SoLuong > 0
                    AND CAST(GETDATE() AS DATE) BETWEEN NgayBD AND NgayKT
            ) AS TongMaGiamGia,

            (
                SELECT ISNULL(SUM(TongTien), 0)
                FROM DonHang
                WHERE TrangThaiDonHang = N'Đã giao'
            ) AS TongDoanhThu
    `);

    // 2. Truy vấn thêm danh sách Sản phẩm Dài hạn sắp hết hạn (<= 7 ngày)
    const expiringResult = await pool.request().query(`
        SELECT MaSP, TenSP, SoLuongTon, HanSuDung, GiamToiDa 
        FROM SanPham 
        WHERE LoaiHang = N'Dài hạn' 
          AND HanSuDung IS NOT NULL 
          AND DATEDIFF(day, GETDATE(), HanSuDung) BETWEEN 0 AND 7 
          AND TrangThai = 1
        ORDER BY HanSuDung ASC
    `);

    // 3. Kết hợp dữ liệu lại thành 1 object
    const data = summaryResult.recordset[0];
    
    // Gắn thêm mảng danh sách sản phẩm cận date vào object data
    // Thuộc tính này sẽ được gọi bằng res.data.SanPhamCanDate ở file Dashboard.jsx
    data.SanPhamCanDate = expiringResult.recordset;

    return data;

};

module.exports = {
    getDashboard
};