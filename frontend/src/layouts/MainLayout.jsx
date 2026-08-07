import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/Common/ChatWidget';
import useScrollDirection from '../hooks/useScrollDirection';
import './MainLayout.css';

const MainLayout = () => {
  const isVisible = useScrollDirection();

  return (
    <div className="main-layout">
      <div
        className="sticky-top-wrapper"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="global-topbar">
          Freeship đơn từ 199k &nbsp;•&nbsp; Giảm 10% toàn bộ hóa đơn hôm nay
        </div>
        <Header />
      </div>

      <div className="main-content">
        <Outlet />
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default MainLayout;