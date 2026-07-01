import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State mới: Lưu trữ phương thức giao hàng ('standard' hoặc 'store')
  const [shippingType, setShippingType] = useState('standard'); 
  const navigate = useNavigate();

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

  const updateQuantity = (id, delta) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 }; 
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    if(window.confirm("Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ?")) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  // Logic tính tiền mới: Cập nhật phí vận chuyển ngay tại giỏ hàng
  const subTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = shippingType === 'standard' ? 22000 : 0; 
  const totalAmount = subTotal + shippingFee;

  const handleGoToCheckout = () => {
    if (cartItems.length === 0) return alert("Giỏ hàng đang trống!");
    // TRUYỀN DỮ LIỆU: Đẩy cả giỏ hàng và kiểu giao hàng sang trang Checkout
    navigate('/checkout', { state: { cartItems, shippingType } });
  };

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>⏳ Đang tải vườn ươm...</h2>;

  return (
    <div className="cart-page">
      <h2 className="cart-header">Giỏ hàng của bạn 🌱</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Giỏ hàng chưa có sản phẩm nào.</p>
          <Link to="/" style={{ color: '#4caf50', fontWeight: 'bold', textDecoration: 'none' }}>&larr; Tiếp tục mua sắm</Link>
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
                      <button onClick={() => removeItem(item.id)} className="btn-remove" title="Xóa">🗑️</button>
                    </td>
                    <td className="cart-col-product">
                      <div className="product-icon">
                        {item.name.toLowerCase().includes('cà rốt') ? '🥕' : item.name.toLowerCase().includes('xoài') ? '🥭' : '🥬'}
                      </div>
                      <div>
                        <h4 className="product-name">{item.name}</h4>
                        <span style={{ fontSize: '12px', color: '#888' }}>Loại: 1 kg</span>
                      </div>
                    </td>
                    <td className="cart-col-price">{item.price.toLocaleString()} đ</td>
                    <td className="cart-col-qty">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn">-</button>
                        <input type="text" readOnly value={item.quantity} className="qty-input" />
                        <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn">+</button>
                      </div>
                    </td>
                    <td className="cart-col-total">{(item.price * item.quantity).toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="promo-section">
              <h3 className="promo-title">Mã ưu đãi</h3>
              <div className="promo-input-group">
                <input type="text" placeholder="Nhập mã ưu đãi (nếu có)" className="promo-input" />
                <button className="btn-apply-promo">Áp dụng</button>
              </div>
            </div>
          </div>

          <div className="cart-right">
            <div className="summary-box">
              <h3 className="summary-title">Tổng cộng giỏ hàng</h3>
              
              <div className="summary-row">
                <span>Tạm tính</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{subTotal.toLocaleString()} đ</span>
              </div>

              <div className="shipping-options">
                <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Giao hàng</div>
                {/* Thay đổi State khi click radio */}
                <label className="shipping-label">
                  <input 
                    type="radio" name="shipping" 
                    checked={shippingType === 'standard'} 
                    onChange={() => setShippingType('standard')} 
                  />
                  <span>Giao tiêu chuẩn (Áp dụng phí giao hàng 22.000đ)</span>
                </label>
                <label className="shipping-label">
                  <input 
                    type="radio" name="shipping" 
                    checked={shippingType === 'store'} 
                    onChange={() => setShippingType('store')} 
                  />
                  <span>Giao tại cửa hàng (Nhận hàng trực tiếp, không tính phí)</span>
                </label>
              </div>

              <div className="summary-total">
                <span>Tổng</span>
                <span className="summary-total-val">{totalAmount.toLocaleString()} đ</span>
              </div>

              <button onClick={handleGoToCheckout} className="btn-checkout">
                Tiến hành thanh toán
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;