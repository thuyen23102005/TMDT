import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Checkout.css'; 

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const initialShippingType = location.state?.shippingType || 'standard';
  
  const [shippingType, setShippingType] = useState(initialShippingType);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const subTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = shippingType === 'standard' ? 22000 : 0;
  const totalAmount = subTotal + shippingFee;

  const handleConfirmPayment = () => {
    alert("🎉 Đặt hàng Nông Sản thành công!\nCảm ơn bạn đã mua sắm. Đơn hàng sẽ sớm được giao đến bạn.");
    navigate('/'); 
  };

  const SectionBlock = ({ title, children }) => (
    <div className="checkout-block">
      <h3>{title}</h3>
      {children}
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="checkout-wrapper" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Không có sản phẩm để thanh toán</h2>
        <Link to="/cart" style={{ color: '#007bff' }}>Quay lại giỏ hàng</Link>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        <h2 className="checkout-title">THANH TOÁN</h2>

        <SectionBlock title="ĐỊA CHỈ GIAO HÀNG">
          <div className="info-row">
            <div>
              <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
              <strong>Ngô Thuận</strong> | 102/1C Lê Tấn Bê, Phường An Lạc, Quận Bình Tân, Hồ Chí Minh, VN | 0777190215
            </div>
            <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>Sửa</a>
          </div>
          <div className="info-sub"><span>⊕</span> Giao hàng đến địa chỉ khác</div>
        </SectionBlock>

        <SectionBlock title="PHƯƠNG THỨC VẬN CHUYỂN">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" name="checkoutShipping" value="standard" 
                checked={shippingType === 'standard'} 
                onChange={() => setShippingType('standard')}
                style={{ marginRight: '10px' }} 
              />
              Giao hàng tiêu chuẩn: <strong style={{ marginLeft: '5px' }}>22.000 đ</strong>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" name="checkoutShipping" value="store" 
                checked={shippingType === 'store'} 
                onChange={() => setShippingType('store')} 
                style={{ marginRight: '10px' }} 
              />
              Nhận tại cửa hàng: <strong style={{ color: '#4caf50', marginLeft: '5px' }}>Miễn phí</strong>
            </label>

          </div>
        </SectionBlock>

        <SectionBlock title="PHƯƠNG THỨC THANH TOÁN">
          <div>
            <label className="radio-label">
              <input type="radio" name="payment" value="zalopay" checked={paymentMethod === 'zalopay'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="pay-icon" /> Ví ZaloPay
            </label>
            <label className="radio-label">
              <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPAY" className="pay-icon" /> VNPAY
            </label>
            <label className="radio-label">
              <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <span className="pay-icon-emoji">💵</span> Thanh toán bằng tiền mặt khi nhận hàng
            </label>
          </div>
        </SectionBlock>

        <SectionBlock title="MÃ KHUYẾN MÃI / GIFT CARD">
          <div className="promo-row">
            <input type="text" placeholder="Nhập mã khuyến mãi / Gift Card" className="promo-input" />
            <button className="btn-apply">Áp dụng</button>
          </div>
        </SectionBlock>

        <SectionBlock title="KIỂM TRA LẠI ĐƠN HÀNG">
          <table className="order-table">
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ color: '#333' }}>{item.name}</td>
                  <td className="td-center">{item.price.toLocaleString()} đ</td>
                  <td className="td-center">{item.quantity}</td>
                  <td className="td-right">{(item.price * item.quantity).toLocaleString()} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionBlock>

        <div className="checkout-footer">
          <div><Link to="/cart" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>&larr; Quay lại giỏ hàng</Link></div>
          <div className="summary-box">
            <div className="summary-row"><span>Thành tiền</span><span>{subTotal.toLocaleString()} đ</span></div>
            <div className="summary-row"><span>Phí vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()} đ`}</span></div>
            <div className="summary-total"><span>Tổng Số Tiền (gồm VAT)</span><span className="price">{totalAmount.toLocaleString()} đ</span></div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={handleConfirmPayment} className="btn-confirm">Xác nhận thanh toán</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;