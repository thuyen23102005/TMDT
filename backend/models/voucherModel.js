const { connectDB, sql } = require("../config/db");

// Lấy tất cả
const getAllVoucher = async () => {
    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            MaGG,
            Code,
            LoaiGiam,
            GiaTriGiam,
            NgayBD,
            NgayKT,
            DieuKienApDung,
            SoLuong
        FROM MaGiamGia
        ORDER BY MaGG DESC
    `);

    return result.recordset;
};

// Thêm
const createVoucher = async (voucher) => {

    const pool = await connectDB();

    await pool.request()
        .input("Code", sql.VarChar, voucher.Code)
        .input("LoaiGiam", sql.NVarChar, voucher.LoaiGiam)
        .input("GiaTriGiam", sql.Decimal(18,2), voucher.GiaTriGiam)
        .input("NgayBD", sql.Date, voucher.NgayBD)
        .input("NgayKT", sql.Date, voucher.NgayKT)
        .input("DieuKienApDung", sql.Decimal(18,2), voucher.DieuKienApDung)
        .input("SoLuong", sql.Int, voucher.SoLuong)
        .query(`
            INSERT INTO MaGiamGia
            (
                Code,
                LoaiGiam,
                GiaTriGiam,
                NgayBD,
                NgayKT,
                DieuKienApDung,
                SoLuong
            )
            VALUES
            (
                @Code,
                @LoaiGiam,
                @GiaTriGiam,
                @NgayBD,
                @NgayKT,
                @DieuKienApDung,
                @SoLuong
            )
        `);

};

// Sửa
const updateVoucher = async (id, voucher) => {

    const pool = await connectDB();

    await pool.request()
        .input("MaGG", sql.Int, id)
        .input("Code", sql.VarChar, voucher.Code)
        .input("LoaiGiam", sql.NVarChar, voucher.LoaiGiam)
        .input("GiaTriGiam", sql.Decimal(18,2), voucher.GiaTriGiam)
        .input("NgayBD", sql.Date, voucher.NgayBD)
        .input("NgayKT", sql.Date, voucher.NgayKT)
        .input("DieuKienApDung", sql.Decimal(18,2), voucher.DieuKienApDung)
        .input("SoLuong", sql.Int, voucher.SoLuong)
        .query(`
            UPDATE MaGiamGia
            SET
                Code=@Code,
                LoaiGiam=@LoaiGiam,
                GiaTriGiam=@GiaTriGiam,
                NgayBD=@NgayBD,
                NgayKT=@NgayKT,
                DieuKienApDung=@DieuKienApDung,
                SoLuong=@SoLuong
            WHERE MaGG=@MaGG
        `);

};

// Xóa
const deleteVoucher = async (id) => {

    const pool = await connectDB();

    await pool.request()
        .input("MaGG", sql.Int, id)
        .query(`
            DELETE FROM MaGiamGia
            WHERE MaGG=@MaGG
        `);

};

module.exports = {
    getAllVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher
};