import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Dữ liệu mock (Giả lập giỏ hàng truyền qua)
  const cartItems = [
    { id: 1, name: 'Cà rốt Đà Lạt 🥕', price: 25000, quantity: 2 },
    { id: 2, name: 'Xoài Cát Hòa Lộc 🥭', price: 70000, quantity: 1 }
  ];

  // Tính toán tiền
  const subTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = 22000; // Phí giao hàng tiêu chuẩn
  const totalAmount = subTotal + shippingFee;

  // Hàm xử lý khi bấm Xác nhận thanh toán (Chỉ show thông báo, không gọi Backend)
  const handleConfirmPayment = () => {
    alert("🎉 Đặt hàng Nông Sản thành công!\nCảm ơn bạn đã mua sắm. Đơn hàng sẽ sớm được giao đến bạn.");
    navigate('/'); // Chuyển hướng về trang chủ sau khi thành công
  };

  // Component phụ để bọc các khối trắng cho giống UI Fahasa
  const SectionBlock = ({ title, children }) => (
    <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0f0f0', padding: '20px 0', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Tiêu đề trang */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', color: '#333', margin: 0 }}>THANH TOÁN</h2>
        </div>

        {/* Khối 1: Địa chỉ giao hàng */}
        <SectionBlock title="ĐỊA CHỈ GIAO HÀNG">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '15px' }}>
            <div>
              <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
              <strong>Ngô Thuận</strong> | 102/1C Lê Tấn Bê, Phường An Lạc, Quận Bình Tân, Hồ Chí Minh, VN | 0777190215
            </div>
            <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>Sửa</a>
          </div>
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', color: '#555', fontSize: '15px' }}>
            <span style={{ fontSize: '20px', marginRight: '10px', color: '#c92127' }}>⊕</span>
            Giao hàng đến địa chỉ khác
          </div>
        </SectionBlock>

        {/* Khối 2: Phương thức vận chuyển */}
        <SectionBlock title="PHƯƠNG THỨC VẬN CHUYỂN">
          <div style={{ fontSize: '15px' }}>
            <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
            Giao hàng tiêu chuẩn: <strong>{shippingFee.toLocaleString()} đ</strong>
          </div>
        </SectionBlock>

        {/* Khối 3: Phương thức thanh toán */}
        <SectionBlock title="PHƯƠNG THỨC THANH TOÁN">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="zalopay" checked={paymentMethod === 'zalopay'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ marginRight: '10px' }} />
              <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" style={{ width: '25px', marginRight: '10px' }} />
              Ví ZaloPay
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ marginRight: '10px' }} />
              <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPAY" style={{ width: '25px', marginRight: '10px' }} />
              VNPAY
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ marginRight: '10px' }} />
              <span style={{ fontSize: '24px', marginRight: '10px' }}>💵</span>
              Thanh toán bằng tiền mặt khi nhận hàng
            </label>
          </div>
        </SectionBlock>

        {/* Khối 4: Mã khuyến mãi */}
        <SectionBlock title="MÃ KHUYẾN MÃI / GIFT CARD">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Nhập mã khuyến mãi / Gift Card" style={{ padding: '10px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button style={{ padding: '10px 20px', backgroundColor: '#288ad6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Áp dụng</button>
          </div>
        </SectionBlock>

        {/* Khối 5: Kiểm tra lại đơn hàng */}
        <SectionBlock title="KIỂM TRA LẠI ĐƠN HÀNG">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '15px 0', fontSize: '15px', color: '#333' }}>{item.name}</td>
                  <td style={{ padding: '15px 0', textAlign: 'center', color: '#777' }}>{item.price.toLocaleString()} đ</td>
                  <td style={{ padding: '15px 0', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '15px 0', textAlign: 'right', color: '#c92127', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionBlock>

        {/* Khối Footer: Tổng tiền & Nút xác nhận */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Link to="/cart" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>&larr; Quay lại giỏ hàng</Link>
          </div>
          <div style={{ width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
              <span>Thành tiền</span>
              <span>{subTotal.toLocaleString()} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '15px' }}>
              <span>Phí vận chuyển (Giao hàng tiêu chuẩn)</span>
              <span>{shippingFee.toLocaleString()} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Tổng Số Tiền (gồm VAT)</span>
              <span style={{ color: '#f39c12', fontSize: '24px' }}>{totalAmount.toLocaleString()} đ</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={handleConfirmPayment}
                style={{ width: '100%', padding: '15px 0', backgroundColor: '#c92127', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;