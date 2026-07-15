import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import TreasureChestWidget from "../../components/TreasureChestWidget/TreasureChestWidget";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingType, setShippingType] = useState('standard');
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (storedUser) {
      // Lấy từ Database
      fetch(`http://localhost:5000/api/cart/${storedUser.maTK}`)
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
    } else {
      // Lấy từ LocalStorage
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(localCart);
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, Number(item.quantity) + delta) } : item
      );
      if (!storedUser) localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // HÀM XÓA ĐÃ ĐƯỢC CẬP NHẬT GỌI API
  const removeItem = async (id) => {
    if(window.confirm("Bạn có chắc muốn bỏ sản phẩm này?")) {
      // 1. Cập nhật giao diện (Xóa khỏi màn hình ngay lập tức cho mượt)
      setCartItems(prev => {
        const updatedCart = prev.filter(item => item.id !== id);
        // Nếu chưa đăng nhập thì lưu vào LocalStorage
        if (!storedUser) localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      // 2. Nếu đã đăng nhập -> Gọi API xóa dưới Database
      if (storedUser) {
        try {
          await fetch(`http://localhost:5000/api/cart/remove/${storedUser.maTK}/${id}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.error("Lỗi xóa sản phẩm trên server:", error);
        }
      }
    }
  };

  const handleCheckoutClick = () => {
    if (!storedUser) {
        alert("Vui lòng đăng nhập để tiến hành thanh toán!");
        navigate('/login');
    } else {
        navigate('/checkout', { state: { cartItems, shippingType } });
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
                      <div className="product-icon" style={{ padding: 0, width: '60px', height: '60px', flexShrink: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <img 
                          src={`http://localhost:5000/uploads/${item.HinhAnh || item.image || item.hinh_anh}`} 
                          alt={item.name} 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Img' }}
                        />
                      </div>
                      <h4 className="product-name">{item.name}</h4>
                    </td>
                    <td className="cart-col-price">{Number(item.price).toLocaleString()} đ</td>
                    <td className="cart-col-qty">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <div className="qty-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <button className="btn-checkout" onClick={handleCheckoutClick}>TIẾN HÀNH THANH TOÁN</button>
            </div>
          </div>
        </div>
      )}
      <TreasureChestWidget />
    </div>
  );
};

export default Cart;