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

// 2. Chốt đơn hàng -> trả về MaDH để FE dùng tạo giao dịch MoMo (nếu chọn MoMo)
const checkoutCart = async (req, res) => {
  try {
    const {
        maKH: maTK,
        maDC, // có thể null nếu khách chọn "Nhận tại cửa hàng"
        tongTien,
        trangThaiThanhToan
    } = req.body;

    // maDC là tùy chọn: chỉ bắt buộc khi khách chọn giao hàng tận nơi.
    // Khi khách chọn "Nhận tại cửa hàng", FE gửi maDC = null, không cần kiểm tra địa chỉ.
    if (!tongTien || tongTien <= 0) {
        return res.status(400).json({ message: "Tổng tiền không hợp lệ" });
    }

    const pool = await connectDB();

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) return res.status(400).json({message: "Tài khoản không hợp lệ"});
    const realMaKH = khResult.recordset[0].MaKH;

    // Chỉ kiểm tra quyền sở hữu địa chỉ khi có gửi maDC lên (tức là giao hàng tận nơi)
    if (maDC) {
        const dcResult = await pool.request()
          .input('MaDC', sql.Int, maDC)
          .input('MaKH', sql.Int, realMaKH)
          .query('SELECT MaDC FROM SoDiaChi WHERE MaDC = @MaDC AND MaKH = @MaKH');

        if (dcResult.recordset.length === 0) {
            return res.status(403).json({ message: "Địa chỉ không hợp lệ hoặc không thuộc về tài khoản này" });
        }
    }

    const ttDH = 'Chờ xác nhận';
    // Không tin trạng thái thanh toán do FE tự gửi cho các cổng online;
    // chỉ chấp nhận 'Đã thanh toán' ngay khi tạo đơn với phương thức tiền mặt là không áp dụng (COD luôn là "Chưa thanh toán")
    const ttTT = trangThaiThanhToan === 'Đã thanh toán' ? 'Đã thanh toán' : 'Chưa thanh toán';

    const result = await pool.request()
      .input('MaKH', sql.Int, realMaKH)
      .input("MaDC", sql.Int, maDC || null)
      .input('TongTien', sql.Decimal(18,2), tongTien)
      .input('TrangThaiDH', sql.NVarChar(50), ttDH)
      .input('TrangThaiTT', sql.NVarChar(50), ttTT)
      .query(`
        BEGIN TRAN;
        DECLARE @MaDH INT;
        INSERT INTO DonHang
        (
            MaKH,
            MaDC,
            NgayDat,
            PhiVanChuyen,
            TongTien,
            TrangThaiDonHang,
            TrangThaiThanhToan
        )
        VALUES
        (
            @MaKH,
            @MaDC,
            GETDATE(),
            30000,
            @TongTien,
            @TrangThaiDH,
            @TrangThaiTT
        )
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

        SELECT @MaDH AS MaDH;
      `);

    const maDH = result.recordset[0].MaDH;

    // --- TẠO THÔNG BÁO ĐẶT HÀNG ---
    try {
        await notificationModel.createNotification(
            maTK, 
            'order', 
            'Đặt hàng thành công 🎉', 
            `Đơn hàng của bạn đã được hệ thống ghi nhận và đang chờ xử lý. Tổng tiền: ${tongTien.toLocaleString()} đ.`
        );
    } catch (notifyErr) {
        console.error("Lỗi gửi thông báo đặt hàng:", notifyErr);
    }
    // ------------------------------

    res.json({ message: "Chốt đơn thành công!", maDH });
  } catch (error) {
    console.error("Lỗi khi chốt đơn:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi thanh toán" });
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