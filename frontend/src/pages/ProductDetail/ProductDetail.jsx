import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

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
      
      const filtered = allProductsData
                        .filter(item => item.id !== parseInt(id))
                        .slice(0, 4);
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

  const handleBuyNow = () => {
    navigate('/cart');
  };

  const SectionHeader = ({ title }) => (
    <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '16px', borderRadius: '4px 4px 0 0', textTransform: 'uppercase' }}>
      {title}
    </div>
  );

  if (isLoading) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#4caf50' }}>Đang tải thông tin...</h3>;
  if (!product) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Sản phẩm không tồn tại</h3>;

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      <nav style={{ backgroundColor: 'white', padding: '15px 50px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#2e7d32', fontSize: '20px', fontWeight: 'bold' }}>🌱 Nông Sản Shop</Link>
        <span style={{ margin: '0 10px', color: '#888' }}>/</span>
        <span style={{ color: '#555' }}>{product.name}</span>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: 'white', display: 'flex', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', minHeight: '300px', fontSize: '100px' }}>
             {product.name.toLowerCase().includes('cà rốt') ? '🥕' : product.name.toLowerCase().includes('xoài') ? '🥭' : '🥬'}
          </div>

          <div style={{ width: '60%', paddingLeft: '30px' }}>
            <h1 style={{ fontSize: '24px', color: '#333', margin: '0 0 10px 0' }}>{product.name}</h1>
            <div style={{ color: '#f39c12', marginBottom: '15px', fontSize: '14px' }}>
              ⭐⭐⭐⭐⭐ (0 đánh giá) | <span style={{ color: '#28a745' }}>Đang còn hàng</span>
            </div>
            
            <div style={{ backgroundColor: '#fafafa', padding: '15px', borderLeft: '4px solid #4caf50', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', color: '#d32f2f', fontWeight: 'bold' }}>{product.price.toLocaleString()} đ</span>
            </div>

            <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
              <span style={{ width: '100px', color: '#555' }}>Khu vực:</span>
              <button style={{ padding: '8px 15px', border: '1px solid #ccc', backgroundColor: 'white', marginRight: '10px', borderRadius: '4px' }}>Hồ Chí Minh</button>
            </div>
            <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ width: '100px', color: '#555' }}>Trọng lượng:</span>
              <button style={{ padding: '8px 15px', border: '1px solid #4caf50', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px' }}>1 kg</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
              <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                <button onClick={decreaseQty} style={{ padding: '10px 15px', border: 'none', backgroundColor: '#f0f0f0', cursor: 'pointer' }}>-</button>
                <div style={{ padding: '10px 20px', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', backgroundColor: 'white' }}>{quantity}</div>
                <button onClick={increaseQty} style={{ padding: '10px 15px', border: 'none', backgroundColor: '#f0f0f0', cursor: 'pointer' }}>+</button>
              </div>

              <button style={{ padding: '12px 20px', backgroundColor: '#81c784', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                🛒 Thêm vào giỏ hàng
              </button>
              <button onClick={handleBuyNow} style={{ padding: '12px 30px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '65%', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <SectionHeader title="Mô tả sản phẩm" />
            <div style={{ padding: '20px', color: '#444', lineHeight: '1.6' }}>
              <h3>Chi tiết {product.name}</h3>
              <p>{product.description || "Đây là sản phẩm nông sản sạch được thu hoạch trực tiếp từ các nhà vườn đạt chuẩn VietGAP. Đảm bảo 100% tươi ngon, không chất bảo quản, an toàn cho sức khỏe gia đình bạn."}</p>
              <ul>
                <li>Nguồn gốc rõ ràng, đạt chuẩn an toàn thực phẩm.</li>
                <li>Hỗ trợ đổi trả trong vòng 24h nếu sản phẩm hỏng/dập.</li>
                <li>Giá trị dinh dưỡng cao, thích hợp cho nhiều món ăn.</li>
              </ul>
            </div>
            
            <SectionHeader title={`Đánh giá (${product.name})`} />
            <div style={{ padding: '20px' }}>
              <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '4px', display: 'flex', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div>5 ⭐ <progress value="0" max="100" style={{ margin: '0 10px', width: '150px' }}></progress> 0 đánh giá</div>
                  <div>4 ⭐ <progress value="0" max="100" style={{ margin: '0 10px', width: '150px' }}></progress> 0 đánh giá</div>
                  <div>3 ⭐ <progress value="0" max="100" style={{ margin: '0 10px', width: '150px' }}></progress> 0 đánh giá</div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <button style={{ backgroundColor: '#4caf50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>ĐÁNH GIÁ NGAY</button>
                </div>
              </div>
              <p style={{ color: '#777' }}>Chưa có đánh giá nào.</p>
              
              <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', marginTop: '20px' }}>
                <textarea placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu..." style={{ width: '100%', height: '80px', border: 'none', outline: 'none', resize: 'none' }}></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="text" placeholder="Họ tên (bắt buộc)" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="email" placeholder="Email" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <button style={{ padding: '8px 25px', backgroundColor: '#f1c40f', color: '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>GỬI</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: '35%' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <SectionHeader title="Thông tin sản phẩm" />
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ width: '40%', fontWeight: 'bold', color: '#555' }}>Trọng lượng:</span>
                  <span>1 kg</span>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ width: '40%', fontWeight: 'bold', color: '#555' }}>Khu vực:</span>
                  <span>Hà Nội, Hồ Chí Minh</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
          <SectionHeader title="Các sản phẩm khác" />
          <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
            
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item) => (
                <div key={item.id} style={{ flex: 1, border: '1px solid #eee', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '50px', marginBottom: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '20px' }}>
                    {item.name.toLowerCase().includes('cà rốt') ? '🥕' : item.name.toLowerCase().includes('xoài') ? '🥭' : '🥬'}
                  </div>
                  <h4 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>{item.name}</h4>
                  <p style={{ color: '#d32f2f', fontWeight: 'bold', margin: '0 0 15px 0' }}>{item.price.toLocaleString()} đ</p>
                  
                  <Link to={`/product/${item.id}`} style={{ display: 'block', width: '100%', padding: '10px 0', backgroundColor: '#4caf50', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                    Xem chi tiết
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ width: '100%', textAlign: 'center', color: '#777' }}>Hiện chưa có sản phẩm khác.</p>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;