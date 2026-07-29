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
  const [activeCategory, setActiveCategory] = useState(null);

  // States cho Lọc giá
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMin, setAppliedMin] = useState(null);
  const [appliedMax, setAppliedMax] = useState(null);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Lấy danh mục (Chỉ chạy 1 lần khi load trang)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (error) {
        console.log("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // Lấy sản phẩm (Chạy lại mỗi khi appliedMin hoặc appliedMax thay đổi)
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Gọi API với tham số giá
        const res = await getAllProducts(appliedMin, appliedMax);
        setProducts(res.data);
      } catch (error) {
        console.log("Lỗi tải sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [appliedMin, appliedMax]);

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

  // Lọc theo tên sản phẩm và tên danh mục ở Frontend
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

  // 1. Format giá hiển thị có dấu chấm và chữ đ (VD: 300.000 đ)
  const formatPriceInput = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('vi-VN') + ' đ';
  };

  // 2. Lọc chỉ giữ lại số khi người dùng tự gõ phím
  const handlePriceChange = (e, setter) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Xóa mọi ký tự không phải số
    setter(rawValue);
  };

  // 3. Xử lý cộng/trừ 10.000 khi bấm nút hoặc phím mũi tên
  const handleStep = (value, setter, step) => {
    const currentVal = value ? parseInt(value) : 0;
    const newVal = Math.max(0, currentVal + step); // Không cho phép âm
    setter(newVal.toString());
  };

  // Hàm xử lý áp dụng lọc giá
  const handleApplyPriceFilter = () => {
    setAppliedMin(minPriceInput ? Number(minPriceInput) : null);
    setAppliedMax(maxPriceInput ? Number(maxPriceInput) : null);
  };

  // Hàm xóa lọc giá
  const handleClearPriceFilter = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMin(null);
    setAppliedMax(null);
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
          {/* TÌM KIẾM */}
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

          {/* LỌC THEO GIÁ */}
          <div className="sidebar-block">
            <h3 className="sidebar-title">Lọc theo giá</h3>
            <div className="price-filter-container">
              
              {/* Ô Nhập Giá Từ */}
              <div className="custom-price-wrapper">
                <input
                  type="text"
                  placeholder="Từ"
                  value={formatPriceInput(minPriceInput)}
                  onChange={(e) => handlePriceChange(e, setMinPriceInput)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') { e.preventDefault(); handleStep(minPriceInput, setMinPriceInput, 10000); }
                    if (e.key === 'ArrowDown') { e.preventDefault(); handleStep(minPriceInput, setMinPriceInput, -10000); }
                  }}
                  className="price-input"
                />
                <div className="price-spinners">
                  <button type="button" onClick={() => handleStep(minPriceInput, setMinPriceInput, 10000)}>▲</button>
                  <button type="button" onClick={() => handleStep(minPriceInput, setMinPriceInput, -10000)}>▼</button>
                </div>
              </div>

              <span className="price-separator">-</span>
              
              {/* Ô Nhập Giá Đến */}
              <div className="custom-price-wrapper">
                <input
                  type="text"
                  placeholder="Đến"
                  value={formatPriceInput(maxPriceInput)}
                  onChange={(e) => handlePriceChange(e, setMaxPriceInput)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') { e.preventDefault(); handleStep(maxPriceInput, setMaxPriceInput, 10000); }
                    if (e.key === 'ArrowDown') { e.preventDefault(); handleStep(maxPriceInput, setMaxPriceInput, -10000); }
                  }}
                  className="price-input"
                />
                <div className="price-spinners">
                  <button type="button" onClick={() => handleStep(maxPriceInput, setMaxPriceInput, 10000)}>▲</button>
                  <button type="button" onClick={() => handleStep(maxPriceInput, setMaxPriceInput, -10000)}>▼</button>
                </div>
              </div>

            </div>
            
            <button className="price-filter-btn"onClick={handleApplyPriceFilter}>
                Áp dụng
            </button>
            {/* Chỉ hiện nút Xóa khi đang có bộ lọc */}
            {(appliedMin !== null || appliedMax !== null) && (
              <button className="price-clear-btn" onClick={handleClearPriceFilter}>
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* DANH MỤC */}
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
              <p>Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                  <Link to={`/product/${product.MaSP}`} key={product.MaSP} className="product-card" style={{ position: 'relative' }}>
                      
                      {/* Ưu tiên hiện Hết hàng, nếu còn hàng thì mới hiện Badge giảm giá */}
                      {product.SoLuongTon === 0 ? (
                          <span className="product-badge product-badge-out" style={{ position: 'absolute', top: '10px', right: '10px' }}>Hết hàng</span>
                      ) : (
                          product.TuDongGiamGia && product.GiaGoc > product.DonGia && (
                              <span className="product-badge" style={{ backgroundColor: '#e53935', color: '#fff', position: 'absolute', top: '10px', right: '10px' }}>
                                  -{Math.round(((product.GiaGoc - product.DonGia) / product.GiaGoc) * 100)}%
                              </span>
                          )
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
                          
                          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '40px', justifyContent: 'center' }}>
                              <p className="product-card-price" style={{ margin: 0 }}>
                                  {product.DonGia?.toLocaleString()} đ
                                  {product.DonViTinh && <span className="product-card-unit"> / {product.DonViTinh}</span>}
                              </p>
                              {product.TuDongGiamGia && product.GiaGoc > product.DonGia && (
                                  <p style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', margin: '2px 0 0 0' }}>
                                      {product.GiaGoc?.toLocaleString()} đ
                                  </p>
                              )}
                          </div>
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