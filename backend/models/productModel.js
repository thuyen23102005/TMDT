const { connectDB } = require("../config/db");

const getAllProducts = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            sp.MaSP,
            sp.TenSP,
            dm.TenDM,
            sp.DonGia,
            sp.SoLuongTon,
            sp.DonViTinh,
            sp.TrangThai
        FROM SanPham sp
        INNER JOIN DanhMuc dm
            ON sp.MaDM = dm.MaDM
        ORDER BY sp.MaSP
    `);

    return result.recordset;
};

module.exports = {
    getAllProducts
};