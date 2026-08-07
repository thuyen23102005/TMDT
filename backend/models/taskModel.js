const { connectDB, sql } = require("../config/db");
const redisClient = require("../config/redis"); // Khai báo Redis để đọc giỏ hàng

// Tra MaKH từ MaTK (vì token chỉ chứa maTK)
const getMaKHByMaTK = async (maTK) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaTK", sql.Int, maTK)
        .query(`SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK`);
    return result.recordset[0]?.MaKH;
};

// Lấy danh sách nhiệm vụ đang áp dụng
const getAllTasks = async () => {
    const pool = await connectDB();
    const result = await pool.request().query(`
        SELECT MaNV, TenNV, MoTa, SoDiemThuong, LoaiDieuKien
        FROM NhiemVu
        WHERE TrangThai = 1
    `);
    return result.recordset;
};

// Lấy danh sách MaNV đã nhận điểm trong hôm nay
const getClaimedToday = async (maKH) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaKH", sql.Int, maKH)
        .query(`
            SELECT MaNV FROM KhachHang_NhiemVu
            WHERE MaKH = @MaKH AND NgayNhan = CAST(GETDATE() AS DATE)
        `);
    return result.recordset.map(r => r.MaNV);
};

// Kiểm tra 1 loại điều kiện đã đủ hoàn thành chưa
const checkCondition = async (maKH, loaiDieuKien) => {
    const pool = await connectDB();
    const request = pool.request().input("MaKH", sql.Int, maKH);

    switch (loaiDieuKien) {
        case "DangNhap":
            return true;

        case "ThemGioHang":
            try {
                const d = new Date();
                d.setHours(d.getHours() + 7);
                const todayStr = d.toISOString().split('T')[0];
                
                const taskKey = `task_added_cart:${maKH}:${todayStr}`;
                const hasAdded = await redisClient.get(taskKey);
                
                // Nếu cờ bằng "done" tức là đã bấm thêm sản phẩm, dù xóa khỏi giỏ vẫn tính là hoàn thành
                return hasAdded === "done";
            } catch (err) {
                console.error("Lỗi đọc Redis trong checkCondition ThemGioHang:", err);
                return false;
            }

        case "DatHang":
            const resDatHang = await request.query(`
                SELECT COUNT(*) AS soLuong FROM DonHang
                WHERE MaKH = @MaKH AND CAST(NgayDat AS DATE) = CAST(GETDATE() AS DATE)
            `);
            return resDatHang.recordset[0].soLuong > 0;

        case "DanhGia":
            const resDanhGia = await request.query(`
                SELECT COUNT(*) AS soLuong FROM DanhGia
                WHERE MaKH = @MaKH AND CAST(NgayDG AS DATE) = CAST(GETDATE() AS DATE)
            `);
            return resDanhGia.recordset[0].soLuong > 0;

        default:
            return false;
    }
};

// Ghi nhận nhận điểm: thêm vào KhachHang_NhiemVu + LichSuDiem
const claimTask = async (maKH, task) => {
    const pool = await connectDB();

    // 1. Đánh dấu đã nhận hôm nay
    await pool.request()
        .input("MaKH", sql.Int, maKH)
        .input("MaNV", sql.Int, task.MaNV)
        .query(`
            INSERT INTO KhachHang_NhiemVu (MaKH, MaNV, NgayNhan)
            VALUES (@MaKH, @MaNV, CAST(GETDATE() AS DATE))
        `);

    // 2. Ghi lịch sử cộng điểm
    await pool.request()
        .input("MaKH", sql.Int, maKH)
        .input("SoDiem", sql.Int, task.SoDiemThuong)
        .input("GhiChu", sql.NVarChar(255), `Hoàn thành nhiệm vụ: ${task.TenNV}`)
        .query(`
            INSERT INTO LichSuDiem (MaKH, LoaiDiem, LoaiGD, SoDiem, NgayThucHien, GhiChu)
            VALUES (@MaKH, N'Cộng', N'Nhiệm vụ', @SoDiem, GETDATE(), @GhiChu)
        `);
};

// Tổng điểm hiện có của khách hàng
const getTotalPoints = async (maKH) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input("MaKH", sql.Int, maKH)
        .query(`
            SELECT
                ISNULL(SUM(CASE WHEN LoaiDiem = N'Cộng' THEN SoDiem ELSE 0 END), 0) -
                ISNULL(SUM(CASE WHEN LoaiDiem = N'Trừ' THEN SoDiem ELSE 0 END), 0) AS tongDiem
            FROM LichSuDiem
            WHERE MaKH = @MaKH
        `);
    return result.recordset[0].tongDiem;
};

module.exports = {
    getMaKHByMaTK,
    getAllTasks,
    getClaimedToday,
    checkCondition,
    claimTask,
    getTotalPoints
};