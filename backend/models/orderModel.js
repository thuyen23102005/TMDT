const { connectDB, sql } = require("../config/db");

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
const updateStatus = async (id, status) => {

    const pool = await connectDB();

    await pool.request()

        .input("MaDH", id)

        .input("TrangThaiDonHang", status)

        .query(`
            UPDATE DonHang
            SET TrangThaiDonHang = @TrangThaiDonHang
            WHERE MaDH = @MaDH
        `);

};

const getOrdersByUser = async (maTK) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaTK", sql.Int, maTK)
        .query(`
            SELECT dh.MaDH, dh.NgayDat, dh.TongTien, dh.TrangThaiDonHang, dh.TrangThaiThanhToan
            FROM DonHang dh
            INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
            WHERE kh.MaTK = @MaTK
            ORDER BY dh.NgayDat DESC
        `);
    return result.recordset;
};

const getOrderStatusById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaDH", id)
        .query(`SELECT TrangThaiDonHang FROM DonHang WHERE MaDH = @MaDH`);
    return result.recordset[0]; // Trả về object chứa TrangThaiDonHang
};

module.exports = {
    getAllOrders,
    getOrderDetail,
    updateStatus,
    getOrdersByUser,
    getOrderStatusById // Thêm dòng này
};