const { connectDB, sql } = require("../config/db");

// ==================== TẠO YÊU CẦU ĐỔI/TRẢ ====================
// req.body: { maTK, MaDH, items: JSON string [{ MaSP, lyDo, moTa }] }
// req.files: mảng file, fieldname dạng "anh_{MaSP}"
const createReturnRequest = async (req, res) => {
    let transaction;

    try {
        const pool = await connectDB();
        transaction = new sql.Transaction(pool);

        const { maTK, MaDH } = req.body;
        const items = JSON.parse(req.body.items || "[]");

        if (!maTK || !MaDH || items.length === 0) {
            return res.status(400).json({ message: "Thiếu thông tin yêu cầu đổi/trả." });
        }

        // Lấy MaKH từ MaTK
        const khResult = await pool.request()
            .input("MaTK", sql.Int, maTK)
            .query("SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK");

        if (khResult.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng." });
        }
        const maKH = khResult.recordset[0].MaKH;

        // Không cho gửi trùng yêu cầu cho cùng 1 đơn hàng khi đang có yêu cầu chưa xử lý xong
        const existing = await pool.request()
            .input("MaDH", sql.Int, MaDH)
            .query(`
                SELECT MaYC FROM YeuCauDoiTra
                WHERE MaDH = @MaDH AND TrangThai IN (N'Chờ duyệt', N'Đã duyệt')
            `);
        if (existing.recordset.length > 0) {
            return res.status(400).json({ message: "Đơn hàng này đã có yêu cầu đổi/trả đang xử lý." });
        }

        await transaction.begin();

        // 1. Tạo yêu cầu đổi trả
        const ycResult = await new sql.Request(transaction)
            .input("MaDH", sql.Int, MaDH)
            .input("MaKH", sql.Int, maKH)
            .query(`
                INSERT INTO YeuCauDoiTra (MaDH, MaKH, TrangThai, NgayTao)
                OUTPUT INSERTED.MaYC
                VALUES (@MaDH, @MaKH, N'Chờ duyệt', GETDATE())
            `);
        const maYC = ycResult.recordset[0].MaYC;

        // 2. Tạo chi tiết cho từng sản phẩm + gắn ảnh tương ứng
        for (const item of items) {
            const ctResult = await new sql.Request(transaction)
                .input("MaYC", sql.Int, maYC)
                .input("MaSP", sql.Int, item.MaSP)
                .input("LyDo", sql.NVarChar(50), item.lyDo)
                .input("MoTa", sql.NVarChar(500), item.moTa || null)
                .query(`
                    INSERT INTO ChiTietYeuCauDoiTra (MaYC, MaSP, LyDo, MoTa)
                    OUTPUT INSERTED.MaCTYC
                    VALUES (@MaYC, @MaSP, @LyDo, @MoTa)
                `);
            const maCTYC = ctResult.recordset[0].MaCTYC;

            const anhCuaSanPham = (req.files || []).filter(
                (f) => f.fieldname === `anh_${item.MaSP}`
            );

            for (const anh of anhCuaSanPham) {
                await new sql.Request(transaction)
                    .input("MaCTYC", sql.Int, maCTYC)
                    .input("DuongDan", sql.NVarChar(255), anh.filename)
                    .query(`
                        INSERT INTO AnhMinhChungDoiTra (MaCTYC, DuongDan)
                        VALUES (@MaCTYC, @DuongDan)
                    `);
            }
        }

        await transaction.commit();
        res.status(201).json({ message: "Gửi yêu cầu đổi/trả thành công", MaYC: maYC });
    } catch (err) {
        console.error("Lỗi tạo yêu cầu đổi trả:", err);
        if (transaction) {
            try { await transaction.rollback(); } catch (_) {}
        }
        res.status(500).json({ message: "Lỗi server khi gửi yêu cầu đổi/trả" });
    }
};

// ==================== DANH SÁCH YÊU CẦU CỦA 1 KHÁCH ====================
const getReturnRequestsByUser = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input("MaTK", sql.Int, req.params.maTK)
            .query(`
                SELECT yc.MaYC, yc.MaDH, yc.TrangThai, yc.GhiChuAdmin, yc.NgayTao, yc.NgayCapNhat
                FROM YeuCauDoiTra yc
                INNER JOIN KhachHang kh ON yc.MaKH = kh.MaKH
                WHERE kh.MaTK = @MaTK
                ORDER BY yc.NgayTao DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy yêu cầu đổi trả theo user:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==================== ADMIN: DANH SÁCH TẤT CẢ YÊU CẦU ====================
const getAllReturnRequests = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT yc.MaYC, yc.MaDH, yc.TrangThai, yc.NgayTao,
                   kh.HoTen AS TenKhachHang, tk.Email
            FROM YeuCauDoiTra yc
            INNER JOIN KhachHang kh ON yc.MaKH = kh.MaKH
            INNER JOIN TaiKhoan tk ON kh.MaTK = tk.MaTK
            ORDER BY yc.NgayTao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy danh sách yêu cầu đổi trả:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==================== ADMIN: CHI TIẾT 1 YÊU CẦU ====================
const getReturnRequestDetail = async (req, res) => {
    try {
        const pool = await connectDB();
        const maYC = req.params.id;

        const ycInfo = await pool.request()
            .input("MaYC", sql.Int, maYC)
            .query(`
                SELECT yc.MaYC, yc.MaDH, yc.TrangThai, yc.GhiChuAdmin, yc.NgayTao,
                       kh.HoTen AS TenKhachHang
                FROM YeuCauDoiTra yc
                INNER JOIN KhachHang kh ON yc.MaKH = kh.MaKH
                WHERE yc.MaYC = @MaYC
            `);

        if (ycInfo.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy yêu cầu đổi/trả" });
        }

        const items = await pool.request()
            .input("MaYC", sql.Int, maYC)
            .query(`
                SELECT ct.MaCTYC, ct.MaSP, sp.TenSP, ct.LyDo, ct.MoTa
                FROM ChiTietYeuCauDoiTra ct
                INNER JOIN SanPham sp ON ct.MaSP = sp.MaSP
                WHERE ct.MaYC = @MaYC
            `);

        const images = await pool.request()
            .input("MaYC", sql.Int, maYC)
            .query(`
                SELECT a.MaCTYC, a.DuongDan
                FROM AnhMinhChungDoiTra a
                INNER JOIN ChiTietYeuCauDoiTra ct ON a.MaCTYC = ct.MaCTYC
                WHERE ct.MaYC = @MaYC
            `);

        const itemsWithImages = items.recordset.map((item) => ({
            ...item,
            Anh: images.recordset
                .filter((img) => img.MaCTYC === item.MaCTYC)
                .map((img) => img.DuongDan),
        }));

        res.json({ ...ycInfo.recordset[0], items: itemsWithImages });
    } catch (err) {
        console.error("Lỗi lấy chi tiết yêu cầu đổi trả:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==================== ADMIN: CẬP NHẬT TRẠNG THÁI ====================
const updateReturnStatus = async (req, res) => {
    try {
        const pool = await connectDB();
        const { TrangThai, GhiChuAdmin } = req.body;

        const hopLe = ["Chờ duyệt", "Đã duyệt", "Từ chối", "Hoàn thành"];
        if (!hopLe.includes(TrangThai)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ." });
        }

        await pool.request()
            .input("MaYC", sql.Int, req.params.id)
            .input("TrangThai", sql.NVarChar(30), TrangThai)
            .input("GhiChuAdmin", sql.NVarChar(500), GhiChuAdmin || null)
            .query(`
                UPDATE YeuCauDoiTra
                SET TrangThai = @TrangThai,
                    GhiChuAdmin = @GhiChuAdmin,
                    NgayCapNhat = GETDATE()
                WHERE MaYC = @MaYC
            `);

        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (err) {
        console.error("Lỗi cập nhật trạng thái đổi trả:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    createReturnRequest,
    getReturnRequestsByUser,
    getAllReturnRequests,
    getReturnRequestDetail,
    updateReturnStatus,
};