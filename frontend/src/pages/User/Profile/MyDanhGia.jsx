import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyDanhGia() {
    const [myReviews, setMyReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetch(`${import.meta.env.VITE_API_URL}/api/reviews/user/${user.maTK}`)
                .then(res => res.json())
                .then(data => setMyReviews(data))
                .catch(err => console.error(err));
        }
    }, []);

    // Logic Phân trang
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = myReviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(myReviews.length / reviewsPerPage);

    return (
        <div className="shadow-sm rounded p-4 bg-white border mt-3">
            <h5 className="fw-bold mb-4 text-success">Đánh giá của tôi</h5>
            
            {myReviews.length === 0 ? (
                <p className="text-muted text-center py-4">Bạn chưa đánh giá sản phẩm nào.</p>
            ) : (
                <>
                    <div className="review-list">
                        {currentReviews.map(rv => (
                            <div key={rv.MaDG} className="d-flex mb-4 pb-3 border-bottom">
                                <img 
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${rv.HinhAnh}`} 
                                    alt={rv.TenSP} 
                                    style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px', marginRight: '15px' }}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80' }}
                                />
                                <div className="flex-grow-1">
                                    <Link to={`/product/${rv.MaSP}`} className="fw-bold text-dark text-decoration-none d-block mb-1">{rv.TenSP}</Link>
                                    <div style={{ color: '#ffc107', fontSize: '14px', marginBottom: '5px' }}>
                                        {"★".repeat(rv.SoSao)}{"☆".repeat(5-rv.SoSao)} 
                                        <span style={{ color: '#999', fontSize: '12px', marginLeft: '10px' }}>{new Date(rv.NgayDG).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <p className="mb-0" style={{ color: '#444', fontSize: '14px' }}>{rv.NoiDung}</p>
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

export default MyDanhGia;