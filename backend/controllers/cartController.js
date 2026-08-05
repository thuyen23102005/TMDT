const { connectDB, sql } = require("../config/db");
const notificationModel = require("../models/notificationModel");
const redisClient = require("../config/redis");
const calculatePrice = require("../utils/priceCalculator");
const { sendEmail } = require("../utils/emailService");

const getCartByCustomerId = async (req, res) => {
  try {
    const maTK = req.params.maKH; 
    const pool = await sql.connect(); 

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) return res.json([]); 
    const realMaKH = khResult.recordset[0].MaKH;
    
    const redisKey = `cart:${realMaKH}`;
    const cartData = await redisClient.get(redisKey);
    
    if (!cartData) return res.json([]); 
    const cart = JSON.parse(cartData);
    if (cart.length === 0) return res.json([]);

    const productIds = cart.map(item => item.maSP).join(',');
    
    const result = await pool.request().query(`
        SELECT 
            MaSP AS id, 
            TenSP AS name, 
            DonGia, 
            GiaGoc,          
            GiamToiDa,       
            TuDongGiamGia,   
            HinhAnh
        FROM SanPham
        WHERE MaSP IN (${productIds})
    `);

    const cartItems = result.recordset.map(product => {
        const redisItem = cart.find(item => item.maSP === product.id);
        const finalPrice = calculatePrice(product);

        return {
            id: product.id,
            name: product.name,
            price: finalPrice,
            quantity: redisItem ? redisItem.soLuong : 1,
            HinhAnh: product.HinhAnh
        };
    });

    res.json(cartItems);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng Redis:", error);
    res.status(500).json({ message: "Lỗi server khi tải giỏ hàng" });
  }
};

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

    // ===== NHÁNH 1: KHÁCH VÃNG LAI =====
    if (isGuest) {
        if (!guestInfo || !guestInfo.hoTen || !guestInfo.soDienThoai || !guestInfo.diaChi) {
            return res.status(400).json({ message: "Vui lòng điền đủ thông tin giao hàng" });
        }
        if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });

        for (const item of cartItems) {
            const stock = await pool.request()
                .input("MaSP", sql.Int, item.id || item.maSP)
                .query(`SELECT TenSP, SoLuongTon FROM SanPham WHERE MaSP = @MaSP`);
            if (stock.recordset.length === 0) return res.status(400).json({ message: "Sản phẩm không tồn tại." });
            const sp = stock.recordset[0];
            if (item.quantity > sp.SoLuongTon) return res.status(400).json({ message: `${sp.TenSP} chỉ còn ${sp.SoLuongTon} sản phẩm.` });
        }

        const valuesCTDH = cartItems.map(item => 
            `(@MaDH, ${Number(item.id || item.maSP)}, ${Number(item.quantity)}, ${Number(item.price)}, ${Number(item.quantity) * Number(item.price)})`
        ).join(', ');

        let calculatedSubTotal = cartItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
        let actualShippingFee = tongTien - calculatedSubTotal;

        const resultGuest = await pool.request()
            .input('HoTen', sql.NVarChar(100), guestInfo.hoTen)
            .input('SoDienThoai', sql.VarChar(20), guestInfo.soDienThoai)
            .input('DiaChi', sql.NVarChar(255), guestInfo.diaChi)
            .input('PhiVanChuyen', sql.Decimal(18,2), actualShippingFee)
            .input('TongTien', sql.Decimal(18,2), tongTien)
            .input('TrangThaiDH', sql.NVarChar(50), ttDH)
            .input('TrangThaiTT', sql.NVarChar(50), ttTT)
            .query(`
                BEGIN TRAN;
                BEGIN TRY
                    DECLARE @DummyMaTK INT; DECLARE @DummyMaKH INT; DECLARE @NewMaDC INT; DECLARE @MaDH INT;
                    SELECT @DummyMaTK = MaTK FROM TaiKhoan WHERE TenDangNhap = 'khachvanglai';
                    IF @DummyMaTK IS NULL BEGIN INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, SoDienThoai, VaiTro, TrangThai, NgayTao) VALUES ('khachvanglai', '123456', 'guest@nongsanshop.com', NULL, 'KhachHang', 1, GETDATE()); SET @DummyMaTK = SCOPE_IDENTITY(); END
                    SELECT @DummyMaKH = MaKH FROM KhachHang WHERE MaTK = @DummyMaTK;
                    IF @DummyMaKH IS NULL BEGIN INSERT INTO KhachHang (HoTen, MaTK) VALUES ('Khách Vãng Lai', @DummyMaTK); SET @DummyMaKH = SCOPE_IDENTITY(); END
                    
                    INSERT INTO SoDiaChi (MaKH, HoTen, SoDienThoai, DiaChiChiTiet, MacDinh) VALUES (@DummyMaKH, @HoTen, @SoDienThoai, @DiaChi, 0); SET @NewMaDC = SCOPE_IDENTITY();
                    INSERT INTO DonHang (MaKH, MaDC, NgayDat, PhiVanChuyen, TongTien, TrangThaiDonHang, TrangThaiThanhToan) VALUES (@DummyMaKH, @NewMaDC, GETDATE(), @PhiVanChuyen, @TongTien, @TrangThaiDH, @TrangThaiTT); SET @MaDH = SCOPE_IDENTITY();
                    INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia, ThanhTien) VALUES ${valuesCTDH};
                    COMMIT TRAN;
                    SELECT @MaDH AS maDH; 
                END TRY
                BEGIN CATCH ROLLBACK TRAN; THROW; END CATCH
            `);

        const createdMaDH = resultGuest.recordset[0].maDH;

        // EMAIL KHÁCH VÃNG LAI CÓ ĐÍNH KÈM NÚT XEM CHI TIẾT
        if (guestInfo.email) {
            const orderTrackingLink = `http://localhost:5173/order-detail/${createdMaDH}`;
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f9f5; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2e7d32; text-align: center;">Cảm ơn bạn đã đặt hàng tại Nông Sản Shop! 🌱</h2>
                    <p>Xin chào <strong>${guestInfo.hoTen}</strong>,</p>
                    <p>Đơn hàng <strong>#${createdMaDH}</strong> của bạn đã được khởi tạo thành công và đang chờ cửa hàng xác nhận.</p>
                    <p style="font-size: 16px; font-weight: bold; color: #d32f2f;">Tổng tiền thanh toán: ${Number(tongTien).toLocaleString()} đ</p>
                    <p>Địa chỉ giao hàng: ${guestInfo.diaChi}</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${orderTrackingLink}" target="_blank" style="background-color: #2e7d32; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 15px; display: inline-block;">
                            🔍 Xem chi tiết đơn hàng #${createdMaDH}
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                    <p style="font-size: 13px; color: #777; text-align: center;">Cửa hàng sẽ sớm liên hệ xác nhận và giao hàng cho bạn!</p>
                </div>
            `;
            sendEmail(guestInfo.email, `[Nông Sản Shop] Xác nhận đơn hàng #${createdMaDH} thành công`, htmlContent);
        }

        return res.json({ message: "Chốt đơn thành công!", maDH: createdMaDH });
    } 

    // ===== NHÁNH 2: LOGIC USER CÓ TÀI KHOẢN =====
    if (!tongTien || tongTien <= 0) return res.status(400).json({ message: "Tổng tiền không hợp lệ" });

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) return res.status(400).json({message: "Tài khoản không hợp lệ"});
    const realMaKH = khResult.recordset[0].MaKH;

    let finalMaDC;
    if (!maDC) {
        const storeAddrResult = await pool.request()
            .input('MaKH', sql.Int, realMaKH)
            .query(`
                INSERT INTO SoDiaChi (MaKH, HoTen, SoDienThoai, DiaChiChiTiet, MacDinh)
                OUTPUT INSERTED.MaDC
                VALUES (@MaKH, N'Nhận tại cửa hàng', '1900 1234', N'123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh', 0)
            `);
        finalMaDC = storeAddrResult.recordset[0].MaDC;
    } else {
        const dcResult = await pool.request()
          .input('MaDC', sql.Int, maDC).input('MaKH', sql.Int, realMaKH)
          .query('SELECT MaDC FROM SoDiaChi WHERE MaDC = @MaDC AND MaKH = @MaKH');
        if (dcResult.recordset.length === 0) return res.status(403).json({ message: "Địa chỉ không hợp lệ" });
        finalMaDC = maDC;
    }

    const redisKey = `cart:${realMaKH}`;
    const cartData = await redisClient.get(redisKey);
    if (!cartData) return res.status(400).json({ message: "Giỏ hàng đang trống" });
    
    const cart = JSON.parse(cartData);
    if (cart.length === 0) return res.status(400).json({ message: "Giỏ hàng đang trống" });

    const productIds = cart.map(item => item.maSP).join(',');
    const productsQuery = await pool.request().query(`
        SELECT MaSP, TenSP, DonGia, GiaGoc, GiamToiDa, TuDongGiamGia, SoLuongTon
        FROM SanPham WHERE MaSP IN (${productIds})
    `);

    let calculatedSubTotal = 0; 
    const calculatedItems = [];
    
    for (const item of cart) {
        const dbProduct = productsQuery.recordset.find(p => p.MaSP === item.maSP);
        if (!dbProduct) return res.status(400).json({ message: "Có sản phẩm không tồn tại trong hệ thống" });

        if (item.soLuong > dbProduct.SoLuongTon) {
            return res.status(400).json({ message: `${dbProduct.TenSP} chỉ còn ${dbProduct.SoLuongTon} sản phẩm.` });
        }
        
        const finalPrice = calculatePrice(dbProduct);
        const thanhTien = item.soLuong * finalPrice;
        calculatedSubTotal += thanhTien; 
        
        calculatedItems.push(
            `(@MaDH, ${item.maSP}, ${item.soLuong}, ${finalPrice}, ${thanhTien})`
        );
    }

    const actualShippingFee = tongTien - calculatedSubTotal;
    const valuesCTDH = calculatedItems.join(', ');

    const resultUser = await pool.request()
      .input('MaKH', sql.Int, realMaKH)
      .input("MaDC", sql.Int, finalMaDC)
      .input('PhiVanChuyen', sql.Decimal(18,2), actualShippingFee) 
      .input('TongTien', sql.Decimal(18,2), tongTien)
      .input('TrangThaiDH', sql.NVarChar(50), ttDH)
      .input('TrangThaiTT', sql.NVarChar(50), ttTT)
      .query(`
        BEGIN TRAN;
        BEGIN TRY
            DECLARE @MaDH INT;
            
            INSERT INTO DonHang (MaKH, MaDC, NgayDat, PhiVanChuyen, TongTien, TrangThaiDonHang, TrangThaiThanhToan) 
            VALUES (@MaKH, @MaDC, GETDATE(), @PhiVanChuyen, @TongTien, @TrangThaiDH, @TrangThaiTT);
            SET @MaDH = SCOPE_IDENTITY();
            
            INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, DonGia, ThanhTien) VALUES ${valuesCTDH};
            
            COMMIT TRAN;
            SELECT @MaDH AS maDH;
        END TRY
        BEGIN CATCH ROLLBACK TRAN; THROW; END CATCH
      `);

    const createdMaDH = resultUser.recordset[0].maDH;

    await redisClient.del(redisKey);

    // EMAIL USER CÓ ĐÍNH KÈM NÚT XEM CHI TIẾT
    try {
        const userRes = await pool.request()
            .input("MaTK", sql.Int, maTK)
            .query(`
                SELECT tk.Email, kh.HoTen 
                FROM TaiKhoan tk
                JOIN KhachHang kh ON tk.MaTK = kh.MaTK
                WHERE tk.MaTK = @MaTK
            `);

        if (userRes.recordset.length > 0 && userRes.recordset[0].Email) {
            const { Email, HoTen } = userRes.recordset[0];
            const orderTrackingLink = `http://localhost:5173/order-detail/${createdMaDH}`;
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f9f5; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2e7d32; text-align: center;">Cảm ơn bạn đã đặt hàng tại Nông Sản Shop! 🌱</h2>
                    <p>Xin chào <strong>${HoTen || 'Quý khách'}</strong>,</p>
                    <p>Đơn hàng <strong>#${createdMaDH}</strong> của bạn đã được khởi tạo thành công và đang chờ cửa hàng xác nhận.</p>
                    <p style="font-size: 16px; font-weight: bold; color: #d32f2f;">Tổng tiền thanh toán: ${Number(tongTien).toLocaleString()} đ</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${orderTrackingLink}" target="_blank" style="background-color: #2e7d32; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 15px; display: inline-block;">
                            🔍 Xem chi tiết đơn hàng #${createdMaDH}
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                    <p style="font-size: 13px; color: #777; text-align: center;">Chúng tôi sẽ gửi thêm email cập nhật khi đơn hàng được chuyển sang trạng thái mới!</p>
                </div>
            `;
            sendEmail(Email, `[Nông Sản Shop] Xác nhận đơn hàng #${createdMaDH} thành công`, htmlContent);
        }
    } catch (emailErr) {
        console.error("Lỗi khi gửi email chốt đơn cho user:", emailErr);
    }

    return res.json({ message: "Chốt đơn thành công!", maDH: createdMaDH });
  } catch (error) {
    console.error("Lỗi khi chốt đơn:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi thanh toán", error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { maKH: maTK, maSP, soLuong } = req.body;
    const pool = await sql.connect();

    const khResult = await pool.request()
      .input('MaTK', sql.Int, maTK)
      .query('SELECT MaKH FROM KhachHang WHERE MaTK = @MaTK');

    if (khResult.recordset.length === 0) {
        return res.status(400).json({ message: "Tài khoản chưa được liên kết với khách hàng" });
    }
    const realMaKH = khResult.recordset[0].MaKH;

    const redisKey = `cart:${realMaKH}`;
    let cartData = await redisClient.get(redisKey);
    let cart = cartData ? JSON.parse(cartData) : [];

    const existingItemIndex = cart.findIndex(item => item.maSP === Number(maSP));
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].soLuong += (Number(soLuong) || 1);
        if (cart[existingItemIndex].soLuong <= 0) cart[existingItemIndex].soLuong = 1;
    } else {
        cart.push({ maSP: Number(maSP), soLuong: Number(soLuong) || 1 });
    }

    await redisClient.setEx(redisKey, 259200, JSON.stringify(cart));

    res.status(200).json({ message: "Đã thêm vào giỏ hàng (Redis)" });
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng Redis:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

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

    const redisKey = `cart:${realMaKH}`;
    let cartData = await redisClient.get(redisKey);
    let cart = cartData ? JSON.parse(cartData) : [];

    for (let localItem of localCart) {
      const realSP = Number(localItem.maSP || localItem.id); 
      const qty = Number(localItem.quantity) || 1;

      const existingItemIndex = cart.findIndex(item => item.maSP === realSP);
      
      if (existingItemIndex !== -1) {
          cart[existingItemIndex].soLuong += qty;
      } else {
          cart.push({ maSP: realSP, soLuong: qty });
      }
    }

    await redisClient.setEx(redisKey, 259200, JSON.stringify(cart));

    res.status(200).json({ message: "Đồng bộ giỏ hàng thành công!" });
  } catch (error) {
    console.error("Lỗi đồng bộ giỏ hàng Redis:", error);
    res.status(500).json({ message: "Lỗi server khi đồng bộ" });
  }
};

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

    const redisKey = `cart:${realMaKH}`;
    let cartData = await redisClient.get(redisKey);
    
    if (cartData) {
        let cart = JSON.parse(cartData);
        cart = cart.filter(item => item.maSP !== Number(maSP));
        
        if (cart.length > 0) {
            await redisClient.setEx(redisKey, 259200, JSON.stringify(cart));
        } else {
            await redisClient.del(redisKey);
        }
    }

    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm Redis:", error);
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