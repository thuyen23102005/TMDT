import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Checkout.css'; 

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const initialShippingType = location.state?.shippingType || 'standard';
  
  const [shippingType, setShippingType] = useState(initialShippingType);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQR, setShowQR] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);

  // LOGIC ĐỊA CHỈ THẬT
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        fetch(`http://localhost:5000/api/addresses/${storedUser.maTK}`)
            .then(res => res.json())
            .then(data => {
                setAddresses(data);
                // Mặc định chọn địa chỉ có MacDinh = true, nếu không thì lấy cái đầu tiên
                if (data.length > 0) {
                    const defaultAddr = data.find(a => a.MacDinh) || data[0];
                    setSelectedAddress(defaultAddr);
                }
            })
            .catch(err => console.error(err));
    }
  }, []);

  const subTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = shippingType === 'standard' ? 22000 : 0;
  const totalAmount = subTotal + shippingFee;

  const handleProcessOrder = async (trangThaiThanhToan) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return navigate('/login');
    if (!selectedAddress) return alert("Vui lòng thêm địa chỉ giao hàng!");

    setIsProcessing(true);
    try {
        const response = await fetch('http://localhost:5000/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maKH: storedUser.maTK,
                maDC: selectedAddress.MaDC,
                tongTien: totalAmount,
                trangThaiThanhToan: trangThaiThanhToan
            })
        });

        if (response.ok) {
            alert("🎉 Đặt hàng Nông Sản thành công!");
            navigate('/profile/don-hang'); 
        } else {
            alert("Có lỗi xảy ra khi thanh toán!");
        }
    } catch (error) {
        alert("Lỗi kết nối Server.");
    } finally {
        setIsProcessing(false);
        setShowQR(false);
    }
  };

  const handleConfirmClick = () => {
    if (!selectedAddress) {
        alert("Vui lòng thêm và chọn địa chỉ giao hàng trước khi thanh toán!");
        return;
    }
    if (paymentMethod === 'vnpay' || paymentMethod === 'zalopay') {
        setShowQR(true); 
    } else {
        handleProcessOrder('Chưa thanh toán'); 
    }
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
        <Link to="/cart" style={{ color: '#2e7d32' }}>Quay lại giỏ hàng</Link>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper position-relative">
      <div className="checkout-container">
        <h2 className="checkout-title">THANH TOÁN</h2>

        <SectionBlock title="ĐỊA CHỈ GIAO HÀNG">
          <div className="info-row d-flex justify-content-between align-items-center">
            {selectedAddress ? (
                <div>
                    <span className="text-danger me-2">📍</span>
                    <strong>{selectedAddress.HoTen} ({selectedAddress.SoDienThoai})</strong> 
                    <span className="ms-2 text-muted">{selectedAddress.DiaChiChiTiet}</span>
                    {selectedAddress.MacDinh ? <span className="badge border border-danger text-danger ms-2 bg-white">Mặc định</span> : ''}
                </div>
            ) : (
                <div className="text-danger fw-bold">Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ!</div>
            )}
            <button onClick={() => setShowAddressModal(true)} className="btn btn-link text-primary text-decoration-none">Thay Đổi</button>
          </div>
        </SectionBlock>

        <SectionBlock title="PHƯƠNG THỨC VẬN CHUYỂN">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="checkoutShipping" value="standard" checked={shippingType === 'standard'} onChange={() => setShippingType('standard')} style={{ marginRight: '10px' }} />
              Giao hàng tiêu chuẩn: <strong style={{ marginLeft: '5px' }}>22.000 đ</strong>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="checkoutShipping" value="store" checked={shippingType === 'store'} onChange={() => setShippingType('store')} style={{ marginRight: '10px' }} />
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
          <div><Link to="/cart" style={{ color: '#2e7d32', textDecoration: 'none', fontSize: '14px' }}>&larr; Quay lại giỏ hàng</Link></div>
          <div className="summary-box">
            <div className="summary-row"><span>Thành tiền</span><span>{subTotal.toLocaleString()} đ</span></div>
            <div className="summary-row"><span>Phí vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()} đ`}</span></div>
            <div className="summary-total"><span>Tổng Số Tiền</span><span className="price">{totalAmount.toLocaleString()} đ</span></div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={handleConfirmClick} className="btn-confirm" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHỌN ĐỊA CHỈ */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Địa Chỉ Của Tôi</h5>
                    <button onClick={() => setShowAddressModal(false)} className="btn-close"></button>
                </div>
                <div className="p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {addresses.length === 0 && <p className="text-center text-muted">Vui lòng vào mục Sổ địa chỉ trong Profile để thêm mới!</p>}
                    {addresses.map(addr => (
                        <div key={addr.MaDC} className="d-flex align-items-start mb-3 border-bottom pb-3">
                            <input 
                                type="radio" name="addressSelection" className="mt-1 me-3" 
                                checked={selectedAddress?.MaDC === addr.MaDC}
                                onChange={() => setSelectedAddress(addr)}
                            />
                            <div className="flex-grow-1">
                                <div>
                                    <span className="fw-bold me-2">{addr.HoTen}</span>
                                    <span className="text-muted small">{addr.SoDienThoai}</span>
                                </div>
                                <div className="text-muted small mt-1">{addr.DiaChiChiTiet}</div>
                                {addr.MacDinh ? <span className="badge border border-danger text-danger bg-white mt-2">Mặc định</span> : ''}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-top text-end bg-light">
                    <button onClick={() => setShowAddressModal(false)} className="btn btn-secondary me-2">Hủy</button>
                    <button onClick={() => setShowAddressModal(false)} className="btn btn-danger">Xác nhận</button>
                </div>
            </div>
        </div>
      )}

      {/* POPUP MÃ QR */}
      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', width: '350px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                <h4 style={{ color: '#2e7d32', marginBottom: '15px' }}>
                    Quét mã {paymentMethod === 'vnpay' ? 'VNPAY' : 'ZaloPay'}
                </h4>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ThanhToanNongSan_${totalAmount}VND`} alt="QR Code" style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }} />
                <h5 style={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '20px' }}>Số tiền: {totalAmount.toLocaleString()} đ</h5>
                
                <button onClick={() => handleProcessOrder('Đã thanh toán')} className="btn btn-success w-100 mb-2" disabled={isProcessing}>
                    {isProcessing ? "Đang xác nhận..." : "Tôi đã quét thanh toán"}
                </button>
                <button onClick={() => setShowQR(false)} className="btn btn-outline-secondary w-100" disabled={isProcessing}>
                    Hủy bỏ
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;