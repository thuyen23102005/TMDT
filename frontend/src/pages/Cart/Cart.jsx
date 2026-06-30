import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu giỏ hàng khi trang vừa load
  useEffect(() => {
    fetch('http://localhost:5000/api/cart/1')
      .then((response) => response.json())
      .then((data) => {
        setCartItems(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi kéo dữ liệu từ Backend:", error);
        setIsLoading(false);
      });
  }, []);

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const navigate = useNavigate();
  const handleGoToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống trơn!");
      return;
    }
    navigate('/checkout'); // Nhảy sang trang Thanh toán
  };

  if (isLoading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>⏳ Đang tải vườn ươm...</h2>;
  }

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '900px', 
      margin: '40px auto', 
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', 
      backgroundColor: '#f9fdfa', 
      borderRadius: '20px', 
      boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)', 
      border: '1px solid #e8f5e9' 
    }}>
      
      <h2 style={{ 
        color: '#2e7d32', 
        borderBottom: '2px dashed #a5d6a7', 
        paddingBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        Giỏ hàng Nông Sản 🌱
      </h2>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', padding: '40px 20px' }}>
          Giỏ hàng của bạn đang trống. Hãy thêm chút màu xanh nhé!
        </p>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginTop: '25px', 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#4caf50', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '18px 15px' }}>Sản phẩm tươi sạch</th>
              <th style={{ padding: '18px 15px', textAlign: 'center' }}>Đơn giá</th>
              <th style={{ padding: '18px 15px', textAlign: 'center' }}>Số lượng</th>
              <th style={{ padding: '18px 15px', textAlign: 'right' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid #e8f5e9', 
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfdfc',
                transition: 'background-color 0.3s'
              }}>
                <td style={{ padding: '18px 15px', color: '#1b5e20', fontWeight: '600', fontSize: '16px' }}>
                  {item.name}
                </td>
                <td style={{ padding: '18px 15px', textAlign: 'center', color: '#666' }}>
                  {item.price.toLocaleString()} đ
                </td>
                <td style={{ padding: '18px 15px', textAlign: 'center' }}>
                   <span style={{ 
                     padding: '6px 16px', 
                     backgroundColor: '#e8f5e9', 
                     borderRadius: '20px', 
                     color: '#2e7d32', 
                     fontWeight: 'bold',
                     border: '1px solid #c8e6c9'
                   }}>
                     {item.quantity}
                   </span>
                </td>
                <td style={{ padding: '18px 15px', textAlign: 'right', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
                  {(item.price * item.quantity).toLocaleString()} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ 
        marginTop: '30px', 
        textAlign: 'right', 
        padding: '25px', 
        backgroundColor: '#e8f5e9', 
        borderRadius: '15px',
        border: '1px dashed #81c784'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32', fontSize: '20px' }}>
          Tổng thanh toán: <span style={{ color: '#d32f2f', fontSize: '28px', marginLeft: '10px' }}>{totalAmount.toLocaleString()} đ</span>
        </h3>
        <button 
          onClick={handleGoToCheckout}
          style={{ 
            padding: '14px 30px', 
            backgroundColor: '#ff9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
            transition: 'transform 0.2s'
          }}>
          Tiến hành thanh toán &rarr;
        </button>
      </div>

      <div style={{ marginTop: '25px', textAlign: 'center' }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: '#4caf50', 
          fontWeight: 'bold', 
          fontSize: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          &larr; Trở về Vườn ươm (Tiếp tục mua sắm)
        </Link>
      </div>
      
    </div>
  );
};

export default Cart;