import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy danh sách sản phẩm từ Database
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
    <div style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f4f9f5', minHeight: '100vh' }}>
      
      {/* THANH ĐIỀU HƯỚNG */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '15px 50px', backgroundColor: 'white', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '32px' }}>🌱</span>
          <h1 style={{ margin: 0, color: '#2e7d32', fontSize: '24px', fontWeight: 'bold' }}>Nông Sản Shop</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/admin" style={{ textDecoration: 'none', color: '#555', fontWeight: '600' }}>Trang Quản Trị</Link>
          <Link to="/cart" style={{ 
            textDecoration: 'none', backgroundColor: '#ff9800', color: 'white', 
            padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)'
          }}>
            🛒 Giỏ hàng
          </Link>
        </div>
      </nav>

      {/* BANNER CHÍNH */}
      <header style={{ 
        backgroundColor: '#e8f5e9', padding: '80px 20px', textAlign: 'center',
        borderBottom: '1px solid #c8e6c9', backgroundImage: 'linear-gradient(to right bottom, #e8f5e9, #c8e6c9)'
      }}>
        <h2 style={{ color: '#1b5e20', fontSize: '42px', margin: '0 0 15px 0' }}>Mang thiên nhiên vào bữa ăn của bạn</h2>
        <p style={{ color: '#388e3c', fontSize: '18px', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
          Cung cấp các loại rau củ quả hữu cơ, trái cây tươi sạch 100% từ các nông trại đạt chuẩn. Giao hàng tận nơi, bao đổi trả!
        </p>
      </header>

      {/* DANH SÁCH SẢN PHẨM TỪ DATABASE */}
      <section style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px' }}>
        <h3 style={{ textAlign: 'center', color: '#2e7d32', fontSize: '28px', marginBottom: '40px' }}>
          Sản Phẩm Tươi Mới Hôm Nay 🌻
        </h3>

        {isLoading ? (
          <h4 style={{ textAlign: 'center', color: '#4caf50' }}>⏳ Đang tải nông sản từ vườn...</h4>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map(product => (
              <div key={product.id} style={{ 
                backgroundColor: 'white', borderRadius: '15px', padding: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: '1px solid #f0f0f0'
              }}>
                
                {/* Icon mặc định cho sản phẩm vì data chưa có link hình thật */}
                <div style={{ fontSize: '80px', marginBottom: '15px' }}>
                  {product.name.toLowerCase().includes('cà rốt') ? '🥕' : 
                   product.name.toLowerCase().includes('xoài') ? '🥭' : '🥬'}
                </div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', textAlign: 'center' }}>{product.name}</h4>
                <p style={{ margin: '0 0 20px 0', color: '#e65100', fontSize: '20px', fontWeight: 'bold' }}>
                  {product.price.toLocaleString()} đ
                </p>

                <Link to={`/product/${product.id}`} style={{ 
                  display: 'block', marginTop: 'auto', width: '100%', padding: '12px 0', 
                  backgroundColor: '#e8f5e9', color: '#2e7d32', textAlign: 'center',
                  border: '1px solid #4caf50', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none'
                }}>
                  🔍 Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#2e7d32', color: 'white', padding: '30px', textAlign: 'center', marginTop: '50px' }}>
        <p style={{ margin: 0, fontSize: '16px' }}>© 2026 Nông Sản Shop - Thực phẩm sạch cho mọi nhà.</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>ĐỒ ÁN MÔN HỌC - NGÔ LÊ HOÀNG THUẬN, ĐẶNG MINH THUYÊN, PHẠM MINH TRIẾT</p>
      </footer>

    </div>
  );
};

export default Home;