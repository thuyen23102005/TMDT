import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productApi';
import { getCategories } from '../../services/categoryApi';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsRes, categoriesRes]) => {
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi kéo dữ liệu:", error);
        setIsLoading(false);
      });
  }, []);

  // Lọc theo tên sản phẩm (TenSP) và tên danh mục (TenDM)
  const filteredProducts = products
    .filter((p) => (p?.TenSP ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => !activeCategory || p.TenDM === activeCategory);

  const getIcon = (name) => {
    const lower = (name ?? '').toLowerCase();
    if (lower.includes('cà rốt')) return '🥕';
    if (lower.includes('xoài')) return '🥭';
    if (lower.includes('cam')) return '🍊';
    if (lower.includes('táo')) return '🍎';
    if (lower.includes('chuối')) return '🍌';
    return '🥬';
  };

  if (isLoading) {
    return (
      <h2 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>
        ⏳ Đang tải sản phẩm...
      </h2>
    );
  }

  return (
    <div className="products-page">
      <div className="products-breadcrumb">
        <Link to="/">Trang chủ</Link> <span>/</span> <span className="current">Sản phẩm</span>
      </div>

      <div className="products-layout">

        {/* SIDEBAR */}
        <aside className="products-sidebar">
          <div className="sidebar-block">
            <h3 className="sidebar-title">Tìm kiếm</h3>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          <div className="sidebar-block">
            <h3 className="sidebar-title">Danh mục sản phẩm</h3>
            <ul className="sidebar-category-list">
              <li>
                <button
                  className={!activeCategory ? 'active' : ''}
                  onClick={() => setActiveCategory(null)}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.MaDM}>
                  <button
                    className={activeCategory === cat.TenDM ? 'active' : ''}
                    onClick={() => setActiveCategory(cat.TenDM)}
                  >
                    {cat.TenDM}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="products-main">
          <div className="products-main-header">
            <h1 className="products-title">Sản phẩm</h1>
            <span className="products-count">{filteredProducts.length} sản phẩm</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <p>Không tìm thấy sản phẩm nào.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <Link
                  to={`/product/${product.MaSP}`}
                  key={product.MaSP}
                  className="product-card"
                >
                  {product.SoLuongTon === 0 && (
                    <span className="product-badge product-badge-out">Hết hàng</span>
                  )}

                  <div className="product-card-image">
                    {product.HinhAnh ? (
                      <img
                        src={`http://localhost:5000/uploads/${product.HinhAnh}`}
                        alt={product.TenSP}
                        className="product-card-img"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                      />
                    ) : (
                      <span className="product-card-icon">{getIcon(product.TenSP)}</span>
                    )}
                  </div>

                  <div className="product-card-body">
                    <span className="product-card-category">{product.TenDM}</span>
                    <h4 className="product-card-name">{product.TenSP}</h4>
                    <p className="product-card-price">
                      {product.DonGia?.toLocaleString()} đ
                      {product.DonViTinh && <span className="product-card-unit"> / {product.DonViTinh}</span>}
                    </p>
                    <span className="product-card-btn">Chọn mua</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Products;
