import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './MainLayout.css';

const MainLayout = () => {
  const [keyword, setKeyword] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="main-layout">
      <nav className="main-nav">
        <div className="nav-brand-wrapper">
          <Link to="/" className="nav-brand">
            <span className="nav-logo">🌱</span>
            <h1 className="nav-title">Nông Sản Shop</h1>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="nav-search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">
            🔍
          </button>
        </form>

        <div className="nav-links">
          <Link to="/products" className="link-admin">Sản phẩm</Link>
          <Link to="/admin" className="link-admin">Trang Quản Trị</Link>
          <Link to="/cart" className="link-cart">🛒 Giỏ hàng</Link>

          {user && (
            <span className="nav-greeting">Xin chào, {user.HoTen || user.Ten || user.email}</span>
          )}

          <Link to="/profile" className="link-profile" title="Hồ sơ của tôi">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </nav>

      <div className="main-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;