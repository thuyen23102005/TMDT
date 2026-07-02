import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingType, setShippingType] = useState('standard');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/cart/1')
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map(item => ({
          ...item,
          quantity: Number(item.quantity) || 1
        }));
        setCartItems(formattedData);
        setIsLoading(false);
      })
      .catch((err) => { console.error(err); setIsLoading(false); });
  }, []);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, Number(item.quantity) + delta) } 
        : item
    ));
  };

  const removeItem = (id) => {
    if(window.confirm("Bạn có chắc muốn bỏ sản phẩm này?")) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const subTotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const shippingFee = shippingType === 'standard' ? 22000 : 0;
  const totalAmount = subTotal + shippingFee;

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>Đang tải...</h2>;

  return (
    <div className="cart-page">
      <h2 className="cart-header">Giỏ hàng của bạn 🌱</h2>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Giỏ hàng trống.</p>
          <Link to="/">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-left">
            <table className="cart-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Tạm tính</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="cart-row">
                    <td className="cart-col-action">
                      <button onClick={() => removeItem(item.id)} className="btn-remove">🗑️</button>
                    </td>
                    <td className="cart-col-product">
                      <div className="product-icon">
                        {item.name.toLowerCase().includes('cà rốt') ? '🥕' : '🥭'}
                      </div>
                      <h4 className="product-name">{item.name}</h4>
                    </td>
                    <td className="cart-col-price">{Number(item.price).toLocaleString()} đ</td>
                    <td className="cart-col-qty">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                        
                        <div 
                          className="qty-input" 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {item.quantity}
                        </div>
                        
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </td>
                    <td className="cart-col-total">{(Number(item.price) * item.quantity).toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-right">
            <div className="summary-box">
              <h3 className="summary-title">Tổng cộng</h3>
              <div className="summary-row">
                <span>Tạm tính</span>
                <span style={{ fontWeight: 'bold' }}>{subTotal.toLocaleString()} đ</span>
              </div>
              <div className="shipping-options">
                 <label className="shipping-label">
                   <input type="radio" checked={shippingType === 'standard'} onChange={() => setShippingType('standard')} /> Giao tiêu chuẩn (22.000đ)
                 </label>
                 <label className="shipping-label">
                   <input type="radio" checked={shippingType === 'store'} onChange={() => setShippingType('store')} /> Nhận tại cửa hàng (Miễn phí)
                 </label>
              </div>
              <div className="summary-total">
                <span>Tổng</span>
                <span className="summary-total-val">{totalAmount.toLocaleString()} đ</span>
              </div>
              <button className="btn-checkout" onClick={() => navigate('/checkout', { state: { cartItems, shippingType } })}>TIẾN HÀNH THANH TOÁN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;