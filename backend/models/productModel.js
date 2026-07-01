const { connectDB } = require("../config/db");

const getAllProducts = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT 
            sp.MaSP, 
            sp.TenSP, 
            sp.DonGia, 
            sp.MoTa, 
            sp.HinhAnh,
            sp.SoLuongTon, 
            sp.DonViTinh, 
            sp.TrangThai,  
            dm.TenDM 
        FROM SanPham sp
        INNER JOIN DanhMuc dm ON sp.MaDM = dm.MaDM
    `);
    
    return result.recordset;
};

const getById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('MaSP', id)
        .query(`SELECT * FROM SanPham WHERE MaSP = @MaSP`);
    return result.recordset[0];
};

module.exports = { getAllProducts, getById };