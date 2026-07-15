import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import TreasureChestWidget from '../../components/TreasureChestWidget/TreasureChestWidget';

const ProductDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/api/products/${id}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/products`).then(res => res.json())
    ])
    .then(([productData, allProductsData]) => {
      setProduct(productData);
      const filtered = allProductsData.filter(item => item.MaSP !== parseInt(id)).slice(0, 4);
      setRelatedProducts(filtered);
      setIsLoading(false);
      setQuantity(1); 
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id]);

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  // Xử lý thêm vào giỏ hàng linh hoạt (có user / ko user)
  const handleAddToCart = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> Gửi thẳng lên Backend
      try {
        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            maKH: storedUser.maTK, // Lấy ID tài khoản thật
            maSP: product.MaSP,
            soLuong: quantity
          })
        });

        if (response.ok) {
          alert(`🛒 Đã thêm ${quantity} ${product.TenSP} vào giỏ hàng thành công!`);
        } else {
          alert("Có lỗi xảy ra khi thêm vào giỏ.");
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi kết nối đến server.");
      }
    } else {
      // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> Lưu vào bộ nhớ tạm trình duyệt
      let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      const existingItemIndex = localCart.findIndex(item => item.id === product.MaSP);
      
      if (existingItemIndex >= 0) {
        localCart[existingItemIndex].quantity += quantity; // Cộng dồn số lượng
      } else {
        localCart.push({
          id: product.MaSP,
          maSP: product.MaSP,
          name: product.TenSP,
          price: product.DonGia,
          quantity: quantity,
          HinhAnh: product.HinhAnh || product.image || product.hinh_anh
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(localCart));
      alert(`🛒 Đã lưu ${quantity} ${product.TenSP} vào giỏ tạm! Vui lòng đăng nhập để đồng bộ.`);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const SectionHeader = ({ title }) => <div className="section-title">{title}</div>;

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>Đang tải thông tin...</h3>;
  if (!product) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Sản phẩm không tồn tại</h3>;

  return (
    <div className="pd-wrapper">
      <nav className="pd-breadcrumb">
        <Link to="/" style={{ textDecoration: 'none', color: '#2e7d32', fontSize: '20px', fontWeight: 'bold' }}>🌱 Nông Sản Shop</Link>
        <span style={{ margin: '0 10px', color: '#888' }}>/</span>
        <span style={{ color: '#555' }}>{product.TenSP}</span>
      </nav>

      <div className="pd-container">
        <div className="pd-card">
          <div className="pd-image" style={{ padding: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <img 
              src={`http://localhost:5000/uploads/${product.HinhAnh || product.image || product.hinh_anh}`} 
              alt={product.TenSP} 
              style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/350?text=No+Image' }}
            />
          </div>

          <div className="pd-info">
            <h1 className="pd-title">{product.TenSP}</h1>
            <div className="pd-rating">⭐⭐⭐⭐⭐ (0 đánh giá) | <span style={{ color: '#28a745' }}>Đang còn hàng</span></div>
            
            <div className="pd-price-box"><span className="pd-price">{Number(product.DonGia).toLocaleString()} đ</span></div>

            <div className="pd-variant"><span>Khu vực:</span><button className="btn-outline">Hồ Chí Minh</button></div>
            <div className="pd-variant"><span>Trọng lượng:</span><button className="btn-active">1 kg</button></div>

            <div className="pd-actions">
              <div className="qty-box">
                <button onClick={decreaseQty} className="qty-btn">-</button>
                <div className="qty-input">{quantity}</div>
                <button onClick={increaseQty} className="qty-btn">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-add-cart">🛒 Thêm vào giỏ</button>
              <button onClick={handleBuyNow} className="btn-buy-now">Mua ngay</button>
            </div>
          </div>
        </div>

        <div className="pd-columns">
          <div className="col-main">
            <SectionHeader title="Mô tả sản phẩm" />
            <div style={{ padding: '20px', color: '#444', lineHeight: '1.6' }}>
              <p>{product.MoTa || "Sản phẩm nông sản sạch, đảm bảo 100% tươi ngon, an toàn cho sức khỏe."}</p>
            </div>
          </div>
          <div className="col-side">
            <div className="side-box">
              <SectionHeader title="Thông cải sản phẩm" />
              <div style={{ padding: '15px' }}>
                <div className="side-row"><span style={{ width: '40%', fontWeight: 'bold' }}>Trọng lượng:</span><span>1 kg</span></div>
                <div className="side-row"><span style={{ width: '40%', fontWeight: 'bold' }}>Khu vực:</span><span>Hà Nội, Hồ Chí Minh</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="related-box">
          <SectionHeader title="Các sản phẩm khác" />
          <div className="related-list">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item) => (
                <div key={item.MaSP} className="related-item">
                  <div className="related-icon" style={{ padding: 0, overflow: 'hidden', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                      src={`http://localhost:5000/uploads/${item.HinhAnh || item.image || item.hinh_anh}`} 
                      alt={item.TenSP} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/120?text=No+Image' }}
                    />
                  </div>
                  <h4 style={{ color: '#2e7d32', margin: '10px 0 10px 0' }}>{item.TenSP}</h4>
                  <p style={{ color: '#d32f2f', fontWeight: 'bold', margin: '0 0 15px 0' }}>{Number(item.DonGia).toLocaleString()} đ</p>
                  <Link to={`/product/${item.MaSP}`} className="btn-view-detail">Xem chi tiết</Link>
                </div>
              ))
            ) : (
              <p style={{ width: '100%', textAlign: 'center', color: '#777' }}>Hiện chưa có sản phẩm khác.</p>
            )}
          </div>
        </div>
      </div>

      <TreasureChestWidget />
    </div>
  );
};

export default ProductDetail;