const { connectDB } = require("../config/db");

// Lấy tất cả danh mục
const getAllCategories = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT MaDM, TenDM, MoTa
        FROM DanhMuc
        ORDER BY MaDM
    `);

    return result.recordset;
};

module.exports = {
    getAllCategories
};