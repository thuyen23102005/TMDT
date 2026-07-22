import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 
import TreasureChestWidget from "../../components/TreasureChestWidget/TreasureChestWidget";
import { getAllProducts } from "../../services/Client/productApi";
import PromotionSection from "./PromotionSection";


const categories = [
  'Rau Củ Quả',
  'Trái Cây Tươi',
  'Nông Sản Khô',
  'Thực Phẩm Chế Biến',
  'Đặc Sản Vùng Miền',
  'Hạt Giống',
  'Sản Phẩm Hữu Cơ',
  'Combo Tiết Kiệm'
];

const fallbackSlides = [
  {
    key: 'fallback-1',
    emoji: '🍎',
    title: 'Mang thiên nhiên vào bữa ăn của bạn',
    subtitle: 'Rau củ quả hữu cơ, trái cây tươi 100% từ nông trại đạt chuẩn.',
    cta: 'Khám phá ngay',
    to: '/products',
    bg: 'linear-gradient(135deg, #6DBE8A 0%, #2D6A4F 100%)'
  },
  {
    key: 'fallback-2',
    emoji: '🥕',
    title: 'Giao hàng trong ngày, tươi từ vườn',
    subtitle: 'Đặt trước 10h sáng, nhận hàng ngay trong chiều nay.',
    cta: 'Đặt hàng ngay',
    to: '/products',
    bg: 'linear-gradient(135deg, #40916C 0%, #1B4332 100%)'
  },
  {
    key: 'fallback-3',
    emoji: '🥬',
    title: 'Cam kết 100% không hóa chất',
    subtitle: 'Mỗi sản phẩm đều có nguồn gốc rõ ràng, kiểm định an toàn.',
    cta: 'Tìm hiểu thêm',
    to: '/products',
    bg: 'linear-gradient(135deg, #2D6A4F 0%, #081C15 100%)'
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();
        setProducts(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const productSlides = products.slice(0, 3).map(p => ({
    key: `product-${p.MaSP}`,
    image: `http://localhost:5000/uploads/${p.HinhAnh || p.image || p.hinh_anh}`,
    title: p.TenSP,
    subtitle: `Chỉ từ ${Number(p.DonGia).toLocaleString()} đ — tươi mới mỗi ngày`,
    cta: 'Xem chi tiết',
    to: `/product/${p.MaSP}`
  }));

  const slides = productSlides.length >= 2 ? productSlides : fallbackSlides;

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const goToSlide = (index) => {
    setActiveSlide(index);
    clearInterval(timerRef.current);
    if (slides.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % slides.length);
      }, 5000);
    }
  };

  const goPrev = () => goToSlide((activeSlide - 1 + slides.length) % slides.length);
  const goNext = () => goToSlide((activeSlide + 1) % slides.length);

  return (
    <div className="home-container">

      {/* KHU VỰC BANNER: SIDEBAR DANH MỤC + CAROUSEL */}
      <div className="hc-layout">

        <div className="hc-sidebar">
          {categories.map((cat) => (
            <Link key={cat} to="/products" className="hc-sidebar-item">
              <span>{cat}</span>
              <span>›</span>
            </Link>
          ))}
        </div>

        <header className="hc-carousel">
          <div
            className="hc-track"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div
                key={slide.key}
                className="hc-slide"
                style={!slide.image ? { background: slide.bg } : undefined}
              >
                {slide.image && (
                  <>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="hc-slide-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="hc-slide-overlay" />
                  </>
                )}
                {!slide.image && (
                  <span className="hc-slide-emoji" aria-hidden="true">{slide.emoji}</span>
                )}
                <div className="hc-slide-content">
                  <span className="hc-eyebrow">🌿 Nông Sản Shop</span>
                  <h2 className="hc-title">{slide.title}</h2>
                  <p className="hc-subtitle">{slide.subtitle}</p>
                  <Link to={slide.to} className="hc-cta">{slide.cta} →</Link>
                </div>
              </div>
            ))}
          </div>

          {slides.length > 1 && (
            <>
              <button className="hc-arrow hc-arrow-left" onClick={goPrev} aria-label="Slide trước">‹</button>
              <button className="hc-arrow hc-arrow-right" onClick={goNext} aria-label="Slide sau">›</button>

              <div className="hc-dots">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    className={`hc-dot ${index === activeSlide ? 'hc-dot-active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Đến slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="hc-badge">
            <span>Tươi mỗi ngày</span>
          </div>
        </header>

      </div>

      {/* THANH SLOGAN */}
      <div className="hc-slogan-strip">
        NÔNG SẢN SHOP – MANG THỰC PHẨM SẠCH ĐẾN MỌI GIA ĐÌNH VIỆT
      </div>

      {/* CHƯƠNG TRÌNH KHUYẾN MÃI */}
      <PromotionSection />

      {/* DANH SÁCH SẢN PHẨM */}
      <section className="products-section">
        <h3 className="section-title">
          Sản Phẩm Tươi Mới Hôm Nay 🌻
        </h3>

        {isLoading ? (
          <h4 className="loading-text">⏳ Đang tải nông sản từ vườn...</h4>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product.MaSP} className="product-card">

                  <div className="product-icon" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
                      <img 
                        src={`http://localhost:5000/uploads/${product.HinhAnh || product.image || product.hinh_anh}`} 
                        alt={product.TenSP} 
                        style={{ width: '100%', height: '150px', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }}
                      />
                  </div>

                  <h4 className="product-name">
                      {product.TenSP}
                  </h4>

                  <p className="product-price">
                      {Number(product.DonGia).toLocaleString()} đ
                  </p>

                  <Link
                      to={`/product/${product.MaSP}`}
                      className="btn-details"
                  >
                      🔍 Xem chi tiết
                  </Link>

              </div>
          ))}
          </div>
        )}
      </section>
      <TreasureChestWidget />
    </div>
  );
};

export default Home;