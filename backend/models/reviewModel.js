const { connectDB, sql } = require("../config/db");

const getReviewsByProduct = async (maSP) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaSP", sql.Int, maSP)
        .query(`
            SELECT dg.MaDG, dg.SoSao, dg.NoiDung, dg.NgayDG, kh.HoTen
            FROM DanhGia dg
            JOIN KhachHang kh ON dg.MaKH = kh.MaKH
            WHERE dg.MaSP = @MaSP
            ORDER BY dg.NgayDG DESC
        `);
    return result.recordset;
};

const getReviewsByUser = async (maTK) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaTK", sql.Int, maTK)
        .query(`
            SELECT dg.MaDG, dg.SoSao, dg.NoiDung, dg.NgayDG, dg.MaDH, sp.TenSP, sp.HinhAnh, sp.MaSP
            FROM DanhGia dg
            JOIN KhachHang kh ON dg.MaKH = kh.MaKH
            JOIN SanPham sp ON dg.MaSP = sp.MaSP
            WHERE kh.MaTK = @MaTK
            ORDER BY dg.NgayDG DESC
        `);
    return result.recordset;
};

const checkCanReview = async (maTK, maSP) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaTK", sql.Int, maTK)
        .input("MaSP", sql.Int, maSP)
        .query(`
            SELECT TOP 1 1 
            FROM DonHang dh
            JOIN ChiTietDonHang ct ON dh.MaDH = ct.MaDH
            JOIN KhachHang kh ON dh.MaKH = kh.MaKH
            WHERE kh.MaTK = @MaTK AND ct.MaSP = @MaSP
        `);
    return result.recordset.length > 0;
};

const createReview = async (maTK, maSP, maDH, soSao, noiDung) => {
    const pool = await connectDB();
    
    const khResult = await pool.request()
        .input("MaTK", sql.Int, maTK)
        .query("SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK");
    if(khResult.recordset.length === 0) throw new Error("Tài khoản không hợp lệ");
    const maKH = khResult.recordset[0].MaKH;

    await pool.request()
        .input("MaKH", sql.Int, maKH)
        .input("MaSP", sql.Int, maSP)
        .input("MaDH", sql.Int, maDH) 
        .input("SoSao", sql.Int, soSao)
        .input("NoiDung", sql.NVarChar(500), noiDung)
        .query(`
            INSERT INTO DanhGia (MaKH, MaSP, MaDH, SoSao, NoiDung, NgayDG)
            VALUES (@MaKH, @MaSP, @MaDH, @SoSao, @NoiDung, GETDATE())
        `);
};

// Tổng hợp đánh giá (điểm trung bình, số lượt, vài nhận xét tiêu biểu)
// cho một danh sách MaSP - dùng cho Chatbot tư vấn dựa trên review thật
const getReviewSummaryForProducts = async (maSPList = []) => {

    if (!Array.isArray(maSPList) || maSPList.length === 0) return [];

    const pool = await connectDB();
    const statsRequest = pool.request();

    const placeholders = maSPList.map((maSP, i) => {
        const paramName = `maSP${i}`;
        statsRequest.input(paramName, sql.Int, maSP);
        return `@${paramName}`;
    }).join(", ");

    // 1. Điểm trung bình + số lượt đánh giá theo từng sản phẩm
    const statsResult = await statsRequest.query(`
        SELECT
            MaSP,
            COUNT(*) AS SoLuotDanhGia,
            AVG(CAST(SoSao AS FLOAT)) AS DiemTrungBinh
        FROM DanhGia
        WHERE MaSP IN (${placeholders})
        GROUP BY MaSP
    `);

    const statsMap = {};
    statsResult.recordset.forEach(row => {
        statsMap[row.MaSP] = {
            soLuot: row.SoLuotDanhGia,
            diemTB: Math.round(row.DiemTrungBinh * 10) / 10
        };
    });

    // 2. Lấy vài nhận xét tiêu biểu (ưu tiên sao cao, mới nhất) cho mỗi sản phẩm
    const reviewSummaries = [];

    for (const maSP of Object.keys(statsMap)) {
        const commentsResult = await pool.request()
            .input("MaSP", sql.Int, maSP)
            .query(`
                SELECT TOP 3 SoSao, NoiDung
                FROM DanhGia
                WHERE MaSP = @MaSP
                  AND NoiDung IS NOT NULL
                  AND LTRIM(RTRIM(NoiDung)) <> ''
                ORDER BY SoSao DESC, NgayDG DESC
            `);

        reviewSummaries.push({
            MaSP: Number(maSP),
            soLuotDanhGia: statsMap[maSP].soLuot,
            diemTrungBinh: statsMap[maSP].diemTB,
            nhanXetTieuBieu: commentsResult.recordset.map(r => r.NoiDung)
        });
    }

    return reviewSummaries;
};

module.exports = {
    getReviewsByProduct,
    getReviewsByUser,
    checkCanReview,
    createReview,
    getReviewSummaryForProducts
};