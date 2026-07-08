const sql = require('mssql');

// Hàm lấy chi tiết giỏ hàng theo Mã Khách Hàng
const getCartByCustomerId = async (req, res) => {
  try {
    const maKH = req.params.maKH;
    const pool = await sql.connect(); 
    
    const result = await pool.request()
      .input('MaKH', sql.Int, maKH)
      .query(`
        SELECT 
            sp.MaSP AS id, 
            sp.TenSP AS name, 
            sp.DonGia AS price, 
            ct.SoLuong AS quantity,
            sp.HinhAnh AS HinhAnh
        FROM ChiTietGioHang ct
        JOIN SanPham sp ON ct.MaSP = sp.MaSP
        JOIN GioHang gh ON ct.MaGH = gh.MaGH
        WHERE gh.MaKH = @MaKH
      `);

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

    await pool.request()
      .input('MaKH', sql.Int, maKH)
      .input('DiaChi', sql.NVarChar(255), diaChi)
      .input('TongTien', sql.Decimal(18,2), tongTien)
      .query(`
        BEGIN TRAN;
        DECLARE @MaDH INT;
        INSERT INTO DonHang (MaKH, NgayDat, DiaChiNhan, PhiVanChuyen, TongTien, TrangThaiDonHang, TrangThaiThanhToan)
        VALUES (@MaKH, GETDATE(), @DiaChi, 30000, @TongTien, N'Chờ xử lý', N'Chưa thanh toán');
        SET @MaDH = SCOPE_IDENTITY();
        INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia, ThanhTien)
        SELECT @MaDH, ct.MaSP, ct.SoLuong, sp.DonGia, (ct.SoLuong * sp.DonGia)
        FROM ChiTietGioHang ct
        JOIN GioHang gh ON ct.MaGH = gh.MaGH
        JOIN SanPham sp ON ct.MaSP = sp.MaSP
        WHERE gh.MaKH = @MaKH;
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

const addToCart = async (req, res) => {
  try {
    const { maKH, maSP, soLuong } = req.body;
    const pool = await sql.connect();

    // 1. Kiểm tra xem khách hàng này đã có mã giỏ hàng (MaGH) chưa
    let cartResult = await pool.request()
      .input('MaKH', sql.Int, maKH)
      .query(`SELECT MaGH FROM GioHang WHERE MaKH = @MaKH`);

    let maGH;
    if (cartResult.recordset.length === 0) {
      // Nếu chưa có, tạo giỏ hàng mới
      let newCart = await pool.request()
        .input('MaKH', sql.Int, maKH)
        .query(`INSERT INTO GioHang (MaKH) OUTPUT INSERTED.MaGH VALUES (@MaKH)`);
      maGH = newCart.recordset[0].MaGH;
    } else {
      maGH = cartResult.recordset[0].MaGH; 
    }

    // 2. Kiểm tra xem sản phẩm đã nằm trong giỏ hàng chưa
    let checkItem = await pool.request()
      .input('MaGH', sql.Int, maGH)
      .input('MaSP', sql.Int, maSP)
      .query(`SELECT * FROM ChiTietGioHang WHERE MaGH = @MaGH AND MaSP = @MaSP`);

    if (checkItem.recordset.length > 0) {
      // Nếu có rồi -> Cập nhật cộng dồn số lượng
      await pool.request()
        .input('MaGH', sql.Int, maGH)
        .input('MaSP', sql.Int, maSP)
        .input('SoLuong', sql.Int, soLuong)
        .query(`UPDATE ChiTietGioHang SET SoLuong = SoLuong + @SoLuong WHERE MaGH = @MaGH AND MaSP = @MaSP`);
    } else {
      // Nếu chưa có -> Thêm mới vào chi tiết giỏ hàng
      await pool.request()
        .input('MaGH', sql.Int, maGH)
        .input('MaSP', sql.Int, maSP)
        .input('SoLuong', sql.Int, soLuong)
        .query(`INSERT INTO ChiTietGioHang (MaGH, MaSP, SoLuong) VALUES (@MaGH, @MaSP, @SoLuong)`);
    }

    res.status(200).json({ message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getCartByCustomerId,
  checkoutCart,
  addToCart // Nhớ export hàm mới này ra
};