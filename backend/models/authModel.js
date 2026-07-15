const { connectDB, sql } = require("../config/db");

// Kiểm tra email đã tồn tại chưa
const findByEmail = async (email) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("Email", sql.VarChar, email)
        .query(`SELECT * FROM TaiKhoan WHERE Email = @Email`);

    return result.recordset[0];
};

// Tạo tài khoản mới
const createTaiKhoan = async (tenDangNhap, matKhau, email, soDienThoai) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("TenDangNhap", sql.VarChar, tenDangNhap)
        .input("MatKhau", sql.VarChar, matKhau)
        .input("Email", sql.VarChar, email)
        .input("SoDienThoai", sql.VarChar, soDienThoai)
        .input("VaiTro", sql.NVarChar, "Khách hàng")
        .query(`
            INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, SoDienThoai, VaiTro)
            OUTPUT INSERTED.MaTK
            VALUES (@TenDangNhap, @MatKhau, @Email, @SoDienThoai, @VaiTro)
        `);

    return result.recordset[0].MaTK;
};

// Tạo hồ sơ khách hàng liên kết với tài khoản
const createKhachHang = async (maTK, hoTen) => {
    const pool = await connectDB();

    await pool
        .request()
        .input("MaTK", sql.Int, maTK)
        .input("HoTen", sql.NVarChar, hoTen)
        .query(`
            INSERT INTO KhachHang (MaTK, HoTen)
            VALUES (@MaTK, @HoTen)
        `);
};

// Tạo tài khoản Admin
const createAdmin = async (tenDangNhap, matKhau, email, soDienThoai) => {
    const pool = await connectDB();

    const result = await pool
        .request()
        .input("TenDangNhap", sql.VarChar, tenDangNhap)
        .input("MatKhau", sql.VarChar, matKhau)
        .input("Email", sql.VarChar, email)
        .input("SoDienThoai", sql.VarChar, soDienThoai)
        .input("VaiTro", sql.NVarChar, "Admin")
        .query(`
            INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, SoDienThoai, VaiTro)
            OUTPUT INSERTED.MaTK
            VALUES (@TenDangNhap, @MatKhau, @Email, @SoDienThoai, @VaiTro)
        `);

    return result.recordset[0].MaTK;
};

// Lấy thông tin tài khoản theo MaTK
const findById = async (maTK) => {
    const pool = await connectDB();
    const result = await pool
        .request()
        .input("MaTK", sql.Int, maTK)
        .query(`SELECT * FROM TaiKhoan WHERE MaTK = @MaTK`);
    return result.recordset[0];
};

// Cập nhật mật khẩu mới
const updatePassword = async (maTK, matKhauMoi) => {
    const pool = await connectDB();
    await pool
        .request()
        .input("MaTK", sql.Int, maTK)
        .input("MatKhau", sql.VarChar, matKhauMoi)
        .query(`
            UPDATE TaiKhoan 
            SET MatKhau = @MatKhau 
            WHERE MaTK = @MaTK
        `);
};

module.exports = {
    findByEmail,
    createTaiKhoan,
    createKhachHang,
    findById,
    updatePassword
};