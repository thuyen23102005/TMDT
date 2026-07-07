const { connectDB } = require("../config/db");

const getAllOrders = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            dh.MaDH,
            kh.HoTen,
            dh.NgayDat,
            dh.TongTien,
            dh.TrangThaiDonHang,
            dh.TrangThaiThanhToan
        FROM DonHang dh
        INNER JOIN KhachHang kh
            ON dh.MaKH = kh.MaKH
        ORDER BY dh.MaDH DESC
    `);

    return result.recordset;

};
const getOrderDetail = async (id) => {

    const pool = await connectDB();

    const result = await pool.request()

        .input("MaDH", id)

        .query(`
            SELECT
                sp.TenSP,
                ct.SoLuong,
                ct.DonGia,
                ct.ThanhTien
            FROM ChiTietDonHang ct
            INNER JOIN SanPham sp
                ON ct.MaSP = sp.MaSP
            WHERE ct.MaDH = @MaDH
        `);

    return result.recordset;

};

module.exports = {
    getAllOrders,
    getOrderDetail
};