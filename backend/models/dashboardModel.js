const { connectDB } = require("../config/db");

const getDashboard = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
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
                SELECT COUNT(*)
                FROM MaGiamGia
            ) AS TongMaGiamGia,

            (
                SELECT ISNULL(SUM(TongTien), 0)
                FROM DonHang
                WHERE TrangThaiDonHang = N'Đã giao'
            ) AS TongDoanhThu
    `);

    return result.recordset[0];

};

module.exports = {
    getDashboard
};