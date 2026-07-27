const { connectDB, sql } = require("../config/db");
const notificationModel = require("../models/notificationModel");

// 1. Lấy chi tiết giỏ hàng theo Mã Tài Khoản
const getCartByCustomerId = async (req, res) => {
  try {
    const maTK = req.params.maKH; 
    const pool = await sql.connect(); 

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) return res.json([]); 
    const realMaKH = khResult.recordset[0].MaKH;
    
    const result = await pool.request()
      .input('MaKH', sql.Int, realMaKH)
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

// 2. Chốt đơn hàng
const checkoutCart = async (req, res) => {
  try {
    const {
        isGuest, 
        maKH: maTK,
        maDC, 
        guestInfo,
        cartItems,
        tongTien,
        trangThaiThanhToan
    } = req.body;

    const pool = await connectDB();
    const ttDH = 'Chờ xác nhận';
    const ttTT = trangThaiThanhToan || 'Chưa thanh toán';

    // ===== NHÁNH 1: DÀNH CHO KHÁCH VÃNG LAI =====
    if (isGuest) {
        if (!guestInfo || !guestInfo.hoTen || !guestInfo.soDienThoai || !guestInfo.diaChi) {
            return res.status(400).json({ message: "Vui lòng điền đủ thông tin giao hàng" });
        }
        if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });
        // =============================
        // KIỂM TRA TỒN KHO
        // =============================

        for (const item of cartItems) {

            const stock = await pool.request()
                .input("MaSP", sql.Int, item.id || item.maSP)
                .query(`
                    SELECT
                        TenSP,
                        SoLuongTon
                    FROM SanPham
                    WHERE MaSP = @MaSP
                `);

            if (stock.recordset.length === 0) {

                return res.status(400).json({
                    message: "Sản phẩm không tồn tại."
                });

            }

            const sp = stock.recordset[0];

            if (item.quantity > sp.SoLuongTon) {

                return res.status(400).json({
                    message: `${sp.TenSP} chỉ còn ${sp.SoLuongTon} sản phẩm.`
                });

            }

        }
        const valuesCTDH = cartItems.map(item => 
            `(@MaDH, ${Number(item.id || item.maSP)}, ${Number(item.quantity)}, ${Number(item.price)}, ${Number(item.quantity) * Number(item.price)})`
        ).join(', ');

        const resultGuest = await pool.request()
            .input('HoTen', sql.NVarChar(100), guestInfo.hoTen)
            .input('SoDienThoai', sql.VarChar(20), guestInfo.soDienThoai)
            .input('DiaChi', sql.NVarChar(255), guestInfo.diaChi)
            .input('TongTien', sql.Decimal(18,2), tongTien)
            .input('TrangThaiDH', sql.NVarChar(50), ttDH)
            .input('TrangThaiTT', sql.NVarChar(50), ttTT)
            .query(`
                BEGIN TRAN;
                BEGIN TRY
                    DECLARE @DummyMaTK INT; 
                    DECLARE @DummyMaKH INT; 
                    DECLARE @NewMaDC INT; 
                    DECLARE @MaDH INT;
                    
                    -- 1. Tìm hoặc tự tạo Tài Khoản ảo cho Guest
                    SELECT @DummyMaTK = MaTK FROM TaiKhoan WHERE TenDangNhap = 'khachvanglai';
                    IF @DummyMaTK IS NULL
                    BEGIN
                        INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, SoDienThoai, VaiTro, TrangThai, NgayTao)
                        VALUES ('khachvanglai', '123456', 'guest@nongsanshop.com', NULL, 'KhachHang', 1, GETDATE());
                        SET @DummyMaTK = SCOPE_IDENTITY();
                    END

                    -- 2. Tìm hoặc tự tạo Khách Hàng ảo gắn với tài khoản trên
                    SELECT @DummyMaKH = MaKH FROM KhachHang WHERE MaTK = @DummyMaTK;
                    IF @DummyMaKH IS NULL
                    BEGIN
                        INSERT INTO KhachHang (HoTen, MaTK) VALUES ('Khách Vãng Lai', @DummyMaTK);
                        SET @DummyMaKH = SCOPE_IDENTITY();
                    END
                    
                    -- 3. Lưu thông tin nhận hàng THẬT của khách vào Sổ Địa Chỉ
                    INSERT INTO SoDiaChi (MaKH, HoTen, SoDienThoai, DiaChiChiTiet, MacDinh) 
                    VALUES (@DummyMaKH, @HoTen, @SoDienThoai, @DiaChi, 0); 
                    SET @NewMaDC = SCOPE_IDENTITY();
                    
                    -- 4. Tạo Đơn Hàng
                    INSERT INTO DonHang (MaKH, MaDC, NgayDat, PhiVanChuyen, TongTien, TrangThaiDonHang, TrangThaiThanhToan) 
                    VALUES (@DummyMaKH, @NewMaDC, GETDATE(), 30000, @TongTien, @TrangThaiDH, @TrangThaiTT); 
                    SET @MaDH = SCOPE_IDENTITY();
                    
                    -- 5. Chi tiết đơn hàng
                    INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia, ThanhTien) VALUES ${valuesCTDH};
                    
                    COMMIT TRAN;
                    
                    SELECT @MaDH AS maDH; 
                END TRY
                BEGIN CATCH ROLLBACK TRAN; THROW; END CATCH
            `);

        return res.json({ message: "Chốt đơn thành công!", maDH: resultGuest.recordset[0].maDH });
    } 

    // ===== NHÁNH 2: LOGIC CŨ DÀNH CHO USER CÓ TÀI KHOẢN =====
    if (!maDC) return res.status(400).json({ message: "Vui lòng chọn địa chỉ giao hàng (MaDC)" });
    if (!tongTien || tongTien <= 0) return res.status(400).json({ message: "Tổng tiền không hợp lệ" });

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) return res.status(400).json({message: "Tài khoản không hợp lệ"});
    const realMaKH = khResult.recordset[0].MaKH;

    const dcResult = await pool.request()
      .input('MaDC', sql.Int, maDC)
      .input('MaKH', sql.Int, realMaKH)
      .query('SELECT MaDC FROM SoDiaChi WHERE MaDC = @MaDC AND MaKH = @MaKH');

    if (dcResult.recordset.length === 0) {
        return res.status(403).json({ message: "Địa chỉ không hợp lệ hoặc không thuộc về tài khoản này" });
    }
    const checkStock = await pool.request()
    .input("MaKH", sql.Int, realMaKH)
    .query(`
        SELECT
            sp.TenSP,
            sp.SoLuongTon,
            ct.SoLuong
        FROM ChiTietGioHang ct
        JOIN GioHang gh
            ON gh.MaGH = ct.MaGH
        JOIN SanPham sp
            ON sp.MaSP = ct.MaSP
        WHERE gh.MaKH = @MaKH
    `);

    for (const item of checkStock.recordset) {

        if (item.SoLuong > item.SoLuongTon) {

            return res.status(400).json({

                message: `${item.TenSP} chỉ còn ${item.SoLuongTon} sản phẩm.`

            });

        }

    }

    const resultUser = await pool.request()
      .input('MaKH', sql.Int, realMaKH).input("MaDC", sql.Int, maDC)
      .input('TongTien', sql.Decimal(18,2), tongTien).input('TrangThaiDH', sql.NVarChar(50), ttDH).input('TrangThaiTT', sql.NVarChar(50), ttTT)
      .query(`
        BEGIN TRAN;
        DECLARE @MaDH INT;
        
        INSERT INTO DonHang (MaKH, MaDC, NgayDat, PhiVanChuyen, TongTien, TrangThaiDonHang, TrangThaiThanhToan) VALUES (@MaKH, @MaDC, GETDATE(), 30000, @TongTien, @TrangThaiDH, @TrangThaiTT)
        SET @MaDH = SCOPE_IDENTITY();
        
        INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia, ThanhTien) SELECT @MaDH, ct.MaSP, ct.SoLuong, sp.DonGia, (ct.SoLuong * sp.DonGia) FROM ChiTietGioHang ct JOIN GioHang gh ON ct.MaGH = gh.MaGH JOIN SanPham sp ON ct.MaSP = sp.MaSP WHERE gh.MaKH = @MaKH;
        
        DELETE ct FROM ChiTietGioHang ct JOIN GioHang gh ON ct.MaGH = gh.MaGH WHERE gh.MaKH = @MaKH;
        COMMIT TRAN;
        
        SELECT @MaDH AS maDH;
      `);

    return res.json({ message: "Chốt đơn thành công!", maDH: resultUser.recordset[0].maDH });
  } catch (error) {
    console.error("Lỗi khi chốt đơn:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi thanh toán", error: error.message });
  }
};

// 3. Thêm một sản phẩm vào giỏ
const addToCart = async (req, res) => {
  try {
    const { maKH: maTK, maSP, soLuong } = req.body;
    const pool = await sql.connect();

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) {
        return res.status(400).json({ message: "Tài khoản chưa được liên kết với khách hàng nào" });
    }
    const realMaKH = khResult.recordset[0].MaKH;

    let cartResult = await pool.request()
      .input('MaKH', sql.Int, realMaKH)
      .query(`SELECT MaGH FROM GioHang WHERE MaKH = @MaKH`);

    let maGH;
    if (cartResult.recordset.length === 0) {
      let newCart = await pool.request()
        .input('MaKH', sql.Int, realMaKH)
        .query(`INSERT INTO GioHang (MaKH, NgayTao) OUTPUT INSERTED.MaGH VALUES (@MaKH, GETDATE())`);
      maGH = newCart.recordset[0].MaGH;
    } else {
      maGH = cartResult.recordset[0].MaGH; 
    }

    let checkItem = await pool.request()
      .input('MaGH', sql.Int, maGH)
      .input('MaSP', sql.Int, maSP)
      .query(`SELECT * FROM ChiTietGioHang WHERE MaGH = @MaGH AND MaSP = @MaSP`);

    if (checkItem.recordset.length > 0) {
      await pool.request()
        .input('MaGH', sql.Int, maGH)
        .input('MaSP', sql.Int, maSP)
        .input('SoLuong', sql.Int, Number(soLuong) || 1)
        .query(`UPDATE ChiTietGioHang SET SoLuong = SoLuong + @SoLuong WHERE MaGH = @MaGH AND MaSP = @MaSP`);
    } else {
      await pool.request()
        .input('MaGH', sql.Int, maGH)
        .input('MaSP', sql.Int, maSP)
        .input('SoLuong', sql.Int, Number(soLuong) || 1)
        .query(`INSERT INTO ChiTietGioHang (MaGH, MaSP, SoLuong) VALUES (@MaGH, @MaSP, @SoLuong)`);
    }

    res.status(200).json({ message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. Đồng bộ (Gộp) giỏ hàng LocalStorage vào Database
const mergeCart = async (req, res) => {
  try {
    const { maKH: maTK, localCart } = req.body;
    
    if (!localCart || localCart.length === 0) {
      return res.status(200).json({ message: "Không có giỏ hàng tạm để đồng bộ" });
    }

    const pool = await sql.connect();

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) {
        return res.status(200).json({ message: "Tài khoản Admin không cần đồng bộ giỏ hàng" });
    }
    const realMaKH = khResult.recordset[0].MaKH;

    let cartResult = await pool.request()
      .input('MaKH', sql.Int, realMaKH)
      .query(`SELECT MaGH FROM GioHang WHERE MaKH = @MaKH`);

    let maGH;
    if (cartResult.recordset.length === 0) {
      let newCart = await pool.request()
        .input('MaKH', sql.Int, realMaKH)
        .query(`INSERT INTO GioHang (MaKH, NgayTao) OUTPUT INSERTED.MaGH VALUES (@MaKH, GETDATE())`);
      maGH = newCart.recordset[0].MaGH;
    } else {
      maGH = cartResult.recordset[0].MaGH;
    }

    for (let item of localCart) {
      const realSP = item.maSP || item.id; 

      let checkItem = await pool.request()
        .input('MaGH', sql.Int, maGH)
        .input('MaSP', sql.Int, realSP)
        .query(`SELECT * FROM ChiTietGioHang WHERE MaGH = @MaGH AND MaSP = @MaSP`);

      if (checkItem.recordset.length > 0) {
        await pool.request()
          .input('MaGH', sql.Int, maGH)
          .input('MaSP', sql.Int, realSP)
          .input('SoLuong', sql.Int, Number(item.quantity) || 1)
          .query(`UPDATE ChiTietGioHang SET SoLuong = SoLuong + @SoLuong WHERE MaGH = @MaGH AND MaSP = @MaSP`);
      } else {
        await pool.request()
          .input('MaGH', sql.Int, maGH)
          .input('MaSP', sql.Int, realSP)
          .input('SoLuong', sql.Int, Number(item.quantity) || 1)
          .query(`INSERT INTO ChiTietGioHang (MaGH, MaSP, SoLuong) VALUES (@MaGH, @MaSP, @SoLuong)`);
      }
    }

    res.status(200).json({ message: "Đồng bộ giỏ hàng thành công!" });
  } catch (error) {
    console.error("Lỗi đồng bộ giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server khi đồng bộ" });
  }
};

// 5. HÀM XÓA SẢN PHẨM KHỎI GIỎ HÀNG
const removeFromCart = async (req, res) => {
  try {
    const { maKH: maTK, maSP } = req.params;
    const pool = await sql.connect();

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) {
        return res.status(400).json({ message: "Tài khoản không hợp lệ" });
    }
    const realMaKH = khResult.recordset[0].MaKH;

    let cartResult = await pool.request()
      .input('MaKH', sql.Int, realMaKH)
      .query(`SELECT MaGH FROM GioHang WHERE MaKH = @MaKH`);
      
    if (cartResult.recordset.length > 0) {
        const maGH = cartResult.recordset[0].MaGH;
        
        await pool.request()
            .input('MaGH', sql.Int, maGH)
            .input('MaSP', sql.Int, maSP)
            .query(`DELETE FROM ChiTietGioHang WHERE MaGH = @MaGH AND MaSP = @MaSP`);
    }

    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getCartByCustomerId,
  checkoutCart,
  addToCart,
  mergeCart,
  removeFromCart
};