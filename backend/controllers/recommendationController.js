const { connectDB, sql } = require("../config/db");
const calculatePrice = require("../utils/priceCalculator");

/**
 * GỢI Ý CÁ NHÂN HÓA
 * Logic: 
 * 1. Tìm 2 danh mục khách mua nhiều nhất từ lịch sử đơn hàng ĐÃ GIAO
 * 2. Lấy sản phẩm cùng danh mục đó mà khách CHƯA mua trong 7 ngày gần nhất
 * 3. Nếu khách chưa từng mua gì (khách mới) -> trả về SP đang giảm giá / bán chạy
 *
 * LƯU Ý: Chỉ tính đơn "Đã giao" là lịch sử mua thật sự.
 * Đơn "Đã hủy" / "Chờ xác nhận" / "Đang giao" không tính, vì khách
 * chưa chắc chắn đã nhận và dùng sản phẩm đó.
 */
const getPersonalizedRecommendations = async (req, res) => {
    try {
        const { maTK } = req.params;
        const pool = await connectDB();

        // B1: Tìm danh mục khách mua nhiều nhất (chỉ tính đơn đã giao)
        const topCategories = await pool.request()
            .input("MaTK", sql.Int, maTK)
            .query(`
                SELECT TOP 2 sp.MaDM, COUNT(*) AS SoLan
                FROM DonHang dh
                JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                JOIN ChiTietDonHang ct ON ct.MaDH = dh.MaDH
                JOIN SanPham sp ON sp.MaSP = ct.MaSP
                WHERE kh.MaTK = @MaTK
                AND dh.TrangThaiDonHang = N'Đã giao'
                GROUP BY sp.MaDM
                ORDER BY COUNT(*) DESC
            `);

        let rawProducts = [];

        if (topCategories.recordset.length > 0) {
            const categoryIds = topCategories.recordset.map(r => r.MaDM);

            // B2: Lấy sản phẩm cùng danh mục, loại SP đã mua (đã giao) trong 7 ngày gần đây
            const result = await pool.request()
                .input("MaTK", sql.Int, maTK)
                .query(`
                    SELECT TOP 8 sp.*
                    FROM SanPham sp
                    WHERE sp.MaDM IN (${categoryIds.join(",")})
                    AND sp.MaSP NOT IN (
                        SELECT ct.MaSP
                        FROM ChiTietDonHang ct
                        JOIN DonHang dh ON dh.MaDH = ct.MaDH
                        JOIN KhachHang kh ON kh.MaKH = dh.MaKH
                        WHERE kh.MaTK = @MaTK
                        AND dh.TrangThaiDonHang = N'Đã giao'
                        AND dh.NgayDat >= DATEADD(day, -7, GETDATE())
                    )
                    ORDER BY 
                        CASE WHEN sp.GiaGoc > sp.DonGia THEN 0 ELSE 1 END,
                        NEWID()
                `);

            rawProducts = result.recordset;
        }

        // B3: Khách mới / không đủ dữ liệu -> fallback sang SP đang giảm giá
        if (rawProducts.length === 0) {
            const fallback = await pool.request().query(`
                SELECT TOP 8 sp.*
                FROM SanPham sp
                ORDER BY 
                    CASE WHEN sp.GiaGoc > sp.DonGia THEN 0 ELSE 1 END,
                    NEWID()
            `);
            rawProducts = fallback.recordset;
        }

        // Tính lại giá theo khung giờ hiện tại (đồng bộ với productController)
        const products = rawProducts.map(product => ({
            ...product,
            DonGia: calculatePrice(product)
        }));

        res.json(products);
    } catch (error) {
        console.error("Lỗi lấy gợi ý cá nhân hóa:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * NHẮC MUA LẠI
 * Logic: SP khách đã NHẬN (đơn "Đã giao") lần gần nhất >= 5 ngày trước,
 * và chưa nhận lại kể từ đó.
 */
const getRepurchaseReminders = async (req, res) => {
    try {
        const { maTK } = req.params;
        const pool = await connectDB();

        const result = await pool.request()
            .input("MaTK", sql.Int, maTK)
            .query(`
                SELECT sp.MaSP, sp.TenSP, sp.HinhAnh, sp.DonGia, sp.GiaGoc, sp.DonViTinh,
                       MAX(dh.NgayDat) AS LanMuaGanNhat
                FROM ChiTietDonHang ct
                JOIN DonHang dh ON dh.MaDH = ct.MaDH
                JOIN KhachHang kh ON kh.MaKH = dh.MaKH
                JOIN SanPham sp ON sp.MaSP = ct.MaSP
                WHERE kh.MaTK = @MaTK
                AND dh.TrangThaiDonHang = N'Đã giao'
                GROUP BY sp.MaSP, sp.TenSP, sp.HinhAnh, sp.DonGia, sp.GiaGoc, sp.DonViTinh
                HAVING MAX(dh.NgayDat) <= DATEADD(day, -5, GETDATE())
                ORDER BY MAX(dh.NgayDat) ASC
            `);

        const products = result.recordset.map(product => ({
            ...product,
            DonGia: calculatePrice(product)
        }));

        res.json(products);
    } catch (error) {
        console.error("Lỗi lấy nhắc mua lại:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    getPersonalizedRecommendations,
    getRepurchaseReminders
};