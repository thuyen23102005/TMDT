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
  
  const [isFavorite, setIsFavorite] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  // Lấy thông tin user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  // Xác định key lưu trữ dựa vào user
  const favKey = storedUser ? `favorites_${storedUser.maTK}` : 'favorites';

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/api/products/${id}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/products/all`).then(res => res.json()),
      fetch(`http://localhost:5000/api/reviews/product/${id}`).then(res => res.json())
    ])
    .then(([productData, allProductsData, reviewsData]) => {
      setProduct(productData);
      const filtered = allProductsData.filter(item => item.MaSP !== parseInt(id)).slice(0, 4);
      setRelatedProducts(filtered);
      setReviews(reviewsData);
      setIsLoading(false);
      setQuantity(1); 

      // Đọc đúng key của tài khoản hiện tại
      const favIds = JSON.parse(localStorage.getItem(favKey) || '[]');
      setIsFavorite(favIds.includes(productData.MaSP));
    })
    .catch(err => { console.error(err); setIsLoading(false); });

    if (storedUser) {
        fetch(`http://localhost:5000/api/reviews/check/${storedUser.maTK}/${id}`)
            .then(res => res.json())
            .then(data => setCanReview(data.canReview))
            .catch(err => console.error(err));
    }
  }, [id, favKey]); // Thêm favKey vào dependency

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  const handleAddToCart = async () => {
    if (storedUser) {
      try {
        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            maKH: storedUser.maTK, 
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
      let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = localCart.findIndex(item => item.id === product.MaSP);
      
      if (existingItemIndex >= 0) {
        localCart[existingItemIndex].quantity += quantity; 
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

  // CẬP NHẬT: Xử lý click yêu thích dùng key riêng
  const toggleFavorite = () => {
    let favIds = JSON.parse(localStorage.getItem(favKey) || '[]');
    if (isFavorite) {
      favIds = favIds.filter(favId => favId !== product.MaSP);
    } else {
      favIds.push(product.MaSP);
    }
    localStorage.setItem(favKey, JSON.stringify(favIds));
    setIsFavorite(!isFavorite);
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return alert("Vui lòng nhập nội dung đánh giá!");
    try {
        const res = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maTK: storedUser.maTK, maSP: id, soSao: rating, noiDung: reviewText })
        });
        if (res.ok) {
            alert("Cảm ơn bạn đã đánh giá sản phẩm!");
            setReviewText('');
            setRating(5);
            const newReviews = await fetch(`http://localhost:5000/api/reviews/product/${id}`).then(r => r.json());
            setReviews(newReviews);
        } else {
            const err = await res.json();
            alert(err.message);
        }
    } catch (error) {
        alert("Lỗi kết nối Server.");
    }
  };

  const SectionHeader = ({ title }) => <div className="section-title">{title}</div>;

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>Đang tải thông tin...</h3>;
  if (!product) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Sản phẩm không tồn tại</h3>;

  const avgStar = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.SoSao, 0) / reviews.length).toFixed(1) : 5;

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
            <img src={`http://localhost:5000/uploads/${product.HinhAnh || product.image || product.hinh_anh}`} alt={product.TenSP} style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/350?text=No+Image' }} />
          </div>

          <div className="pd-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h1 className="pd-title" style={{ margin: 0 }}>{product.TenSP}</h1>
                <span 
                    onClick={toggleFavorite}
                    style={{ 
                        fontSize: '32px', 
                        color: '#e91e63', 
                        cursor: 'pointer', 
                        userSelect: 'none',
                        transition: 'transform 0.2s'
                    }}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.8)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                    {isFavorite ? '♥' : '♡'}
                </span>
            </div>
            
            <div className="pd-rating">
                <span style={{color: '#ffc107'}}>{"★".repeat(Math.round(avgStar)) + "☆".repeat(5 - Math.round(avgStar))}</span> 
                ({reviews.length} đánh giá) | <span style={{ color: '#28a745' }}>Đang còn hàng</span>
            </div>
            
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
            <div style={{ padding: '20px', color: '#444', lineHeight: '1.6' }}><p>{product.MoTa || "Sản phẩm nông sản sạch, đảm bảo 100% tươi ngon, an toàn cho sức khỏe."}</p></div>
          </div>
          <div className="col-side">
            <div className="side-box">
              <SectionHeader title="Thông margin phẩm" />
              <div style={{ padding: '15px' }}>
                <div className="side-row"><span style={{ width: '40%', fontWeight: 'bold' }}>Trọng lượng:</span><span>1 kg</span></div>
                <div className="side-row"><span style={{ width: '40%', fontWeight: 'bold' }}>Khu vực:</span><span>Hà Nội, Hồ Chí Minh</span></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', marginTop: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <SectionHeader title="Đánh giá sản phẩm" />
            <div className="review-section" style={{ padding: '10px' }}>
                
                <div className="review-list" style={{ marginBottom: '30px' }}>
                    {reviews.length === 0 ? (
                        <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Chưa có đánh giá nào.</div>
                    ) : (
                        reviews.map(rv => (
                            <div key={rv.MaDG} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{rv.HoTen} <span style={{ color: '#ffc107', marginLeft: '10px' }}>{"★".repeat(rv.SoSao)}{"☆".repeat(5-rv.SoSao)}</span></div>
                                <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>{new Date(rv.NgayDG).toLocaleDateString('vi-VN')}</div>
                                <div style={{ color: '#333' }}>{rv.NoiDung}</div>
                            </div>
                        ))
                    )}
                </div>

                {canReview ? (
                    <div className="review-form" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <h5 style={{ color: '#2e7d32', marginBottom: '15px', fontWeight: 'bold' }}>Viết đánh giá của bạn</h5>
                        <div className="d-flex align-items-center mb-3">
                            <span style={{ marginRight: '15px', fontWeight: '500' }}>Chọn số sao: </span>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer', fontSize: '24px', color: star <= rating ? '#ffc107' : '#e4e5e9', marginRight: '5px' }}>★</span>
                            ))}
                        </div>
                        <textarea className="form-control mb-3" rows="4" placeholder="Nhập nội dung đánh giá..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
                        <button onClick={submitReview} style={{ backgroundColor: '#2e7d32', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Gửi đánh giá</button>
                    </div>
                ) : (
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', color: '#d32f2f', fontStyle: 'italic' }}>
                        * Bạn cần mua và nhận sản phẩm này thành công để có thể viết đánh giá.
                    </div>
                )}
            </div>
        </div>

        <div className="related-box" style={{ marginTop: '30px' }}>
          <SectionHeader title="Các sản phẩm khác" />
          <div className="related-list">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item) => (
                <div key={item.MaSP} className="related-item">
                  <div className="related-icon" style={{ padding: 0, overflow: 'hidden', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={`http://localhost:5000/uploads/${item.HinhAnh || item.image || item.hinh_anh}`} alt={item.TenSP} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/120?text=No+Image' }} />
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