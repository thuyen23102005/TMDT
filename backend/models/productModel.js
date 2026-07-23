const { connectDB, sql } = require("../config/db");

const checkProductName = async (TenSP) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("TenSP", sql.NVarChar, TenSP)
        .query(`
            SELECT 1
            FROM SanPham
            WHERE TenSP = @TenSP
        `);

    return result.recordset.length > 0;
};


const checkCategoryExists = async (MaDM) => {

    const pool = await connectDB();

    const result = await pool.request()
        .input("MaDM", sql.Int, MaDM)
        .query(`
            SELECT 1
            FROM DanhMuc
            WHERE MaDM = @MaDM
        `);

    return result.recordset.length > 0;
};

const getAllProducts = async (page, limit) => {

    const pool = await connectDB();
    const offset = (page - 1) * limit;

    const totalResult = await pool.request().query(`
        SELECT COUNT(*) AS Total
        FROM SanPham
        WHERE TrangThai=1
        `);

    const total = totalResult.recordset[0].Total;

    const result = await pool.request()
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(`
        SELECT
            sp.MaSP,
            sp.TenSP,
            sp.MaDM,
            sp.DonGia,
            sp.MoTa,
            sp.HinhAnh,
            sp.SoLuongTon,
            sp.DonViTinh,
            sp.TrangThai,
            dm.TenDM
        FROM SanPham sp
        INNER JOIN DanhMuc dm
        ON sp.MaDM = dm.MaDM
        WHERE sp.TrangThai = 1
        ORDER BY sp.MaSP DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY 
        `);
    return {

        products: result.recordset,

        total,

        page,

        totalPages: Math.ceil(total/limit)

    };
};
const getAllProductsClient = async () => {

    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            sp.MaSP,
            sp.MaDM,
            sp.TenSP,
            sp.DonGia,
            sp.MoTa,
            sp.HinhAnh,
            sp.SoLuongTon,
            sp.DonViTinh,
            dm.TenDM
        FROM SanPham sp
        INNER JOIN DanhMuc dm
            ON sp.MaDM = dm.MaDM
        WHERE sp.TrangThai = 1 AND sp.SoLuongTon > 0 
        ORDER BY sp.MaSP DESC
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
// Thêm sản phẩm
const createProduct = async (product) => {

    const pool = await connectDB();

    await pool.request()
        .input("TenSP", sql.NVarChar, product.TenSP)
        .input("MaDM", sql.Int, product.MaDM)
        .input("DonGia", sql.Decimal(18,2), product.DonGia)
        .input("MoTa", sql.NVarChar, product.MoTa)
        .input("HinhAnh", sql.NVarChar, product.HinhAnh)
        .input("SoLuongTon", sql.Int, product.SoLuongTon)
        .input("DonViTinh", sql.NVarChar, product.DonViTinh)
        .input("TrangThai", sql.Bit, product.TrangThai)

        .query(`
            INSERT INTO SanPham
            (
                TenSP,
                MaDM,
                DonGia,
                MoTa,
                HinhAnh,
                SoLuongTon,
                DonViTinh,
                TrangThai
            )
            VALUES
            (
                @TenSP,
                @MaDM,
                @DonGia,
                @MoTa,
                @HinhAnh,
                @SoLuongTon,
                @DonViTinh,
                @TrangThai
            )
        `);

};

const updateProduct = async (id, product) => {

    const pool = await connectDB();

    let query = `
        UPDATE SanPham
        SET
            TenSP = @TenSP,
            MaDM = @MaDM,
            DonGia = @DonGia,
            MoTa = @MoTa,
            SoLuongTon = @SoLuongTon,
            DonViTinh = @DonViTinh,
            TrangThai = @TrangThai
    `;

    const request = pool.request()
        .input("TenSP", sql.NVarChar, product.TenSP)
        .input("MaDM", sql.Int, product.MaDM)
        .input("DonGia", sql.Decimal(18,2), product.DonGia)
        .input("MoTa", sql.NVarChar, product.MoTa)
        .input("SoLuongTon", sql.Int, product.SoLuongTon)
        .input("DonViTinh", sql.NVarChar, product.DonViTinh)
        .input("TrangThai", sql.Bit, product.TrangThai)
        .input("MaSP", sql.Int, id);

    // Chỉ cập nhật ảnh nếu người dùng chọn ảnh mới
    if(product.HinhAnh){
        query += `, HinhAnh=@HinhAnh`;

        request.input("HinhAnh", sql.NVarChar, product.HinhAnh);
    }

    query += ` WHERE MaSP=@MaSP`;

    await request.query(query);

};

const deleteProduct = async (id) => {

    const pool = await connectDB();

    await pool.request()
        .input("MaSP", sql.Int, id)
        .query(`
            UPDATE SanPham
            SET TrangThai = 0
            WHERE MaSP = @MaSP
        `);

};

// Tìm sản phẩm liên quan theo từ khóa - dùng cho Chatbot tư vấn
const searchProducts = async (keyword, limit = 5) => {

    const pool = await connectDB();

    const words = keyword.split(/\s+/).filter(w => w.length > 1);

    if (words.length === 0) return [];

    const request = pool.request().input("limit", sql.Int, limit);

    const conditions = words.map((word, i) => {
        const paramName = `kw${i}`;
        request.input(paramName, sql.NVarChar, `%${word}%`);
        return `(sp.TenSP LIKE @${paramName} OR sp.MoTa LIKE @${paramName} OR dm.TenDM LIKE @${paramName})`;
    }).join(" OR ");

    const result = await request.query(`
        SELECT TOP (@limit)
            sp.MaSP,
            sp.TenSP,
            sp.DonGia,
            sp.MoTa,
            sp.SoLuongTon,
            sp.DonViTinh,
            dm.TenDM
        FROM SanPham sp
        INNER JOIN DanhMuc dm
            ON sp.MaDM = dm.MaDM
        WHERE sp.TrangThai = 1 AND sp.SoLuongTon > 0
          AND (${conditions})
        ORDER BY sp.MaSP DESC
    `);

    return result.recordset;
};

module.exports = {
    getAllProducts,
    getAllProductsClient,
    getById,
    createProduct,
    updateProduct,
    deleteProduct,
    checkProductName,
    checkCategoryExists,
    searchProducts

};