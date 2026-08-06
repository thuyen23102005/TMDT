import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FavoritePro() {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const favoritesPerPage = 6;

    const navigate = useNavigate();
    
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const favKey = storedUser ? `favorites_${storedUser.maTK}` : 'favorites';

    useEffect(() => {
        const favIds = JSON.parse(localStorage.getItem(favKey) || '[]');
        
        if (favIds.length === 0) {
            setIsLoading(false);
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/products/all`)
            .then(res => res.json())
            .then(data => {
                const favProducts = data.filter(p => favIds.includes(p.MaSP));
                setFavorites(favProducts);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [favKey]);

    const removeFavorite = (e, maSP) => {
        e.stopPropagation(); 
        
        const updatedFavIds = JSON.parse(localStorage.getItem(favKey) || '[]').filter(id => id !== maSP);
        localStorage.setItem(favKey, JSON.stringify(updatedFavIds));
        
        const newFavs = favorites.filter(p => p.MaSP !== maSP);
        setFavorites(newFavs);

        // Reset về trang trước nếu xóa sản phẩm duy nhất ở trang hiện tại
        if ((currentPage - 1) * favoritesPerPage >= newFavs.length && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToDetail = (maSP) => {
        navigate(`/product/${maSP}`);
    };

    // Logic Phân trang
    const indexOfLastFav = currentPage * favoritesPerPage;
    const indexOfFirstFav = indexOfLastFav - favoritesPerPage;
    const currentFavorites = favorites.slice(indexOfFirstFav, indexOfLastFav);
    const totalPages = Math.ceil(favorites.length / favoritesPerPage);

    if (isLoading) return <p className="text-center mt-4">Đang tải...</p>;
    if (!storedUser) return <p className="text-center mt-4 text-danger">Vui lòng đăng nhập để xem sản phẩm yêu thích.</p>;

    return (
        <div className="bg-white rounded-4 p-4 border shadow-sm">
            <h5 className="mb-4 text-success fw-bold">Sản phẩm yêu thích của bạn</h5>
            
            {favorites.length === 0 ? (
                <div className="text-center p-5 text-muted">
                    <p style={{ fontSize: '40px' }}>♡</p>
                    <p>Bạn chưa có sản phẩm yêu thích nào.</p>
                </div>
            ) : (
                <>
                    <div className="row g-3">
                        {currentFavorites.map(item => (
                            <div key={item.MaSP} className="col-md-4">
                                <div 
                                    className="card h-100 position-relative shadow-sm" 
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #eee' }}
                                    onClick={() => goToDetail(item.MaSP)}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <span 
                                        className="position-absolute"
                                        onClick={(e) => removeFavorite(e, item.MaSP)}
                                        style={{
                                            top: '10px', right: '15px',
                                            fontSize: '28px', color: '#e91e63',
                                            cursor: 'pointer', zIndex: 10,
                                            userSelect: 'none'
                                        }}
                                        title="Bỏ yêu thích"
                                    >
                                        ♥
                                    </span>
                                    
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL}/uploads/${item.HinhAnh || item.image || item.hinh_anh}`} 
                                        className="card-img-top p-3" 
                                        alt={item.TenSP} 
                                        style={{ height: '200px', objectFit: 'contain' }}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image' }}
                                    />
                                    <div className="card-body text-center border-top">
                                        <h6 className="card-title text-success text-truncate">{item.TenSP}</h6>
                                        <p className="card-text text-danger fw-bold mb-0">
                                            {Number(item.DonGia).toLocaleString()} đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* NÚT PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>«</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default FavoritePro;