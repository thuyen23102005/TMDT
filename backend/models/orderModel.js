const { connectDB, sql } = require("../config/db");

const getAllOrders = async (status, fromDate, toDate) => {
    const pool = await connectDB();

    let query = `
        SELECT
            dh.MaDH,
            kh.HoTen AS TenKhachHang,
            dc.HoTen AS NguoiNhan,
            dc.SoDienThoai,
            dc.DiaChiChiTiet,
            dh.NgayDat,
            dh.NgayGiao,
            dh.PhiVanChuyen,
            dh.TongTien,
            dh.TrangThaiDonHang,
            dh.TrangThaiThanhToan
        FROM DonHang dh
        INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
        LEFT JOIN SoDiaChi dc ON dh.MaDC = dc.MaDC
        WHERE 1=1
    `;

    const request = pool.request();

    if (status) {
        query += ` AND dh.TrangThaiDonHang = @Status`;
        request.input("Status", sql.NVarChar, status);
    }

    if (fromDate) {
        query += ` AND CAST(dh.NgayDat AS DATE) >= @FromDate`;
        request.input("FromDate", sql.Date, fromDate);
    }

    if (toDate) {
        query += ` AND CAST(dh.NgayDat AS DATE) <= @ToDate`;
        request.input("ToDate", sql.Date, toDate);
    }

    query += ` ORDER BY dh.MaDH DESC`;

    const result = await request.query(query);
    return result.recordset;
};

const getOrderDetail = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaDH", id)
        .query(`
            SELECT
                sp.MaSP,        
                sp.HinhAnh,   
                sp.TenSP,
                ct.SoLuong,
                ct.DonGia,
                ct.ThanhTien
            FROM ChiTietDonHang ct
            INNER JOIN SanPham sp ON ct.MaSP = sp.MaSP
            WHERE ct.MaDH = @MaDH
        `);
    return result.recordset;
};

// Cập nhật trạng thái đơn hàng. Khi chuyển sang "Đã giao" sẽ tự ghi nhận NgayGiao
// để làm mốc tính hạn đổi/trả.
const updateStatus = async (id, status, paymentStatus) => {
    const pool = await connectDB();

    const setNgayGiao = status === "Đã giao";

    await pool.request()
        .input("MaDH", id)
        .input("TrangThaiDonHang", status)
        .input("TrangThaiThanhToan", paymentStatus)
        .query(`
            UPDATE DonHang
            SET TrangThaiDonHang = @TrangThaiDonHang,
                TrangThaiThanhToan = @TrangThaiThanhToan
                ${setNgayGiao ? ", NgayGiao = ISNULL(NgayGiao, GETDATE())" : ""}
            WHERE MaDH = @MaDH
        `);
};

const getOrdersByUser = async (maTK) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaTK", sql.Int, maTK)
        .query(`
            SELECT 
                dh.MaDH, dh.NgayDat, dh.NgayGiao, dh.TongTien, dh.TrangThaiDonHang, dh.TrangThaiThanhToan,
                (SELECT COUNT(*) FROM ChiTietDonHang ct WHERE ct.MaDH = dh.MaDH) AS TongSoMon,
                (SELECT COUNT(*) FROM DanhGia dg WHERE dg.MaDH = dh.MaDH) AS SoMonDaDanhGia
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

        .query(`
            SELECT
                TrangThaiDonHang,
                TrangThaiThanhToan
            FROM DonHang
            WHERE MaDH = @MaDH
        `);

    return result.recordset[0];

};

// Cập nhật riêng trạng thái thanh toán (dùng cho MoMo IPN / check-status / SePay webhook)
const updatePaymentStatus = async (maDH, trangThaiThanhToan) => {
    const pool = await connectDB();
    await pool.request()
        .input("MaDH", sql.Int, maDH)
        .input("TrangThaiThanhToan", sql.NVarChar(50), trangThaiThanhToan)
        .query(`
            UPDATE DonHang
            SET TrangThaiThanhToan = @TrangThaiThanhToan
            WHERE MaDH = @MaDH
        `);
};

// Lấy riêng trạng thái thanh toán (dùng cho frontend polling khi chờ VietQR/SePay)
const getPaymentStatusById = async (maDH) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaDH", sql.Int, maDH)
        .query(`SELECT TrangThaiThanhToan FROM DonHang WHERE MaDH = @MaDH`);
    return result.recordset[0];
};

module.exports = {
    getAllOrders,
    getOrderDetail,
    updateStatus,
    getOrdersByUser,
    getOrderStatusById,
    updatePaymentStatus,
    getPaymentStatusById
};