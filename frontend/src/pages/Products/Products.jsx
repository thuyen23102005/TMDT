import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../../services/Admin/productApi';
import { getCategories } from '../../services/Admin/categoryApi';
import './Products.css';
import TreasureChestWidget from '../../components/TreasureChestWidget/TreasureChestWidget';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

useEffect(() => {
  setSearchTerm(searchParams.get('search') || '');
}, [searchParams]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

        try {

            const [productsRes, categoriesRes] = await Promise.all([
                getAllProducts(),
                getCategories()
            ]);

            setProducts(productsRes.data);

            setCategories(categoriesRes.data);

        } catch (error) {

            console.log(error);

        } finally {

            setIsLoading(false);

        }

    };

    fetchData();

}, []);
// Chuẩn hóa tiếng Việt: bỏ dấu + chữ thường
const normalizeText = (text) => {
  return (text ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

// Tính khoảng cách giữa 2 chuỗi để tìm gần đúng
const levenshteinDistance = (a, b) => {
  const matrix = Array.from(
    { length: b.length + 1 },
    () => Array(a.length + 1).fill(0)
  );

  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Kiểm tra tên sản phẩm có gần giống từ khóa không
const fuzzyMatch = (productName, keyword) => {
  const name = normalizeText(productName);
  const search = normalizeText(keyword);

  // Không nhập gì thì hiển thị tất cả
  if (!search) return true;

  // Tìm thấy trực tiếp
  if (name.includes(search)) return true;

  // Tách tên sản phẩm thành từng từ
  const words = name.split(/\s+/);

  // Cho phép sai 1-2 ký tự tùy độ dài từ khóa
  const maxDistance =
    search.length <= 3 ? 1 :
    search.length <= 6 ? 2 : 3;

  return words.some((word) => {
    return levenshteinDistance(word, search) <= maxDistance;
  });
};

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
       <TreasureChestWidget />
    </div>
  );
};

export default Products;
