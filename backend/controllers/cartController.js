const sql = require('mssql');

// Hàm lấy chi tiết giỏ hàng theo Mã Khách Hàng
const getCartByCustomerId = async (req, res) => {
  try {
    const maKH = req.params.maKH;
    
    // Kết nối vào database (Giả sử bạn đã cấu hình pool kết nối sẵn)
    const pool = await sql.connect(); 
    
    // Câu Query nối 3 bảng lại với nhau để lấy đúng thông tin Frontend cần
    const result = await pool.request()
      .input('MaKH', sql.Int, maKH)
      .query(`
        SELECT 
            sp.MaSP AS id, 
            sp.TenSP AS name, 
            sp.DonGia AS price, 
            ct.SoLuong AS quantity
        FROM ChiTietGioHang ct
        JOIN SanPham sp ON ct.MaSP = sp.MaSP
        JOIN GioHang gh ON ct.MaGH = gh.MaGH
        WHERE gh.MaKH = @MaKH
      `);

    // Trả dữ liệu về cho React dưới dạng JSON
    res.json(result.recordset);
    
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server khi tải giỏ hàng" });
  }
};

const checkoutCart = async (req, res) => {
  try {
    const { maKH, diaChi, tongTien } = req.body;
    const pool = await sql.connect();

    // Dùng BEGIN TRAN để đảm bảo nếu lỗi ở giữa chừng thì sẽ Rollback lại hết
    await pool.request()
      .input('MaKH', sql.Int, maKH)
      .input('DiaChi', sql.NVarChar(255), diaChi)
      .input('TongTien', sql.Decimal(18,2), tongTien)
      .query(`
        BEGIN TRAN;
        
        DECLARE @MaDH INT;

        -- 1. Tạo Đơn Hàng mới (Mặc định phí ship 30k)
        INSERT INTO DonHang (MaKH, NgayDat, DiaChiNhan, PhiVanChuyen, TongTien, TrangThaiDonHang, TrangThaiThanhToan)
        VALUES (@MaKH, GETDATE(), @DiaChi, 30000, @TongTien, N'Chờ xử lý', N'Chưa thanh toán');
        
        SET @MaDH = SCOPE_IDENTITY(); -- Lấy mã đơn hàng vừa tạo

        -- 2. Đổ dữ liệu từ Giỏ Hàng sang Chi Tiết Đơn Hàng
        INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia, ThanhTien)
        SELECT @MaDH, ct.MaSP, ct.SoLuong, sp.DonGia, (ct.SoLuong * sp.DonGia)
        FROM ChiTietGioHang ct
        JOIN GioHang gh ON ct.MaGH = gh.MaGH
        JOIN SanPham sp ON ct.MaSP = sp.MaSP
        WHERE gh.MaKH = @MaKH;

        -- 3. Dọn sạch Giỏ hàng cũ của khách
        DELETE ct
        FROM ChiTietGioHang ct
        JOIN GioHang gh ON ct.MaGH = gh.MaGH
        WHERE gh.MaKH = @MaKH;

        COMMIT TRAN;
      `);

    res.json({ message: "Chốt đơn thành công! Cảm ơn bạn đã mua hàng." });
  } catch (error) {
    console.error("Lỗi khi chốt đơn:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi thanh toán" });
  }
};

// Nhớ export thêm hàm này ra nhé
module.exports = {
  getCartByCustomerId,
  checkoutCart
};