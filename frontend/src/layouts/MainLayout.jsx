import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <nav className="main-nav">
        <div className="nav-brand-wrapper">
          <Link to="/" className="nav-brand">
            <span className="nav-logo">🌱</span>
            <h1 className="nav-title">Nông Sản Shop</h1>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/products" className="link-admin">Sản phẩm</Link>
          <Link to="/admin" className="link-admin">Trang Quản Trị</Link>
          <Link to="/cart" className="link-cart">🛒 Giỏ hàng</Link>
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