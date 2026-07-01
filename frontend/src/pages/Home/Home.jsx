import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Lỗi kéo dữ liệu sản phẩm:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      
      {/* BANNER CHÍNH */}
      <header className="hero-section">
        <h2 className="hero-title">Mang thiên nhiên vào bữa ăn của bạn</h2>
        <p className="hero-subtitle">
          Cung cấp các loại rau củ quả hữu cơ, trái cây tươi sạch 100% từ các nông trại đạt chuẩn. Giao hàng tận nơi, bao đổi trả!
        </p>
      </header>

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
              <div key={product.id} className="product-card">
                
                <div className="product-icon">
                  {product.name.toLowerCase().includes('cà rốt') ? '🥕' : 
                   product.name.toLowerCase().includes('xoài') ? '🥭' : '🥬'}
                </div>

                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">
                  {product.price.toLocaleString()} đ
                </p>

                <Link to={`/product/${product.id}`} className="btn-details">
                  🔍 Xem chi tiết
                </Link>
                
              </div>
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
};

export default Home;