const sql = require('mssql');

const getAllProducts = async (req, res) => {
  try {
    const pool = await sql.connect();
    
    // Lấy ID, Tên, Giá và Hình ảnh từ bảng SanPham
    const result = await pool.request().query(`
      SELECT 
        MaSP AS id, 
        TenSP AS name, 
        DonGia AS price, 
        HinhAnh AS image
      FROM SanPham
      WHERE TrangThai = 1
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi tải sản phẩm" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect();
    
    const result = await pool.request()
      .input('MaSP', sql.Int, id)
      .query(`
        SELECT MaSP AS id, TenSP AS name, DonGia AS price, MoTa AS description, HinhAnh AS image
        FROM SanPham WHERE MaSP = @MaSP
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getAllProducts, getProductById };