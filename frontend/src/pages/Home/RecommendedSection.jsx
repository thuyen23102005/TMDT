import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPersonalizedRecommendations, getRepurchaseReminders } from "../../services/Client/recommendationApi";

export default function RecommendedSection() {
    const [recommended, setRecommended] = useState([]);
    const [repurchase, setRepurchase] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setLoading(false);
            return; // Khách chưa đăng nhập -> không có lịch sử để cá nhân hóa
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const fetchData = async () => {
            try {
                const [recRes, repRes] = await Promise.all([
                    getPersonalizedRecommendations(parsedUser.maTK),
                    getRepurchaseReminders(parsedUser.maTK)
                ]);
                setRecommended(recRes.data || []);
                setRepurchase(repRes.data || []);
            } catch (err) {
                console.error("Lỗi tải gợi ý cá nhân hóa:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Khách chưa đăng nhập hoặc đang tải -> không hiển thị section này
    if (!user || loading) return null;
    if (recommended.length === 0 && repurchase.length === 0) return null;

    const renderCard = (product) => {
        const hasDiscount = product.GiaGoc > product.DonGia;
        const percent = hasDiscount
            ? Math.round(((product.GiaGoc - product.DonGia) / product.GiaGoc) * 100)
            : 0;

        return (
            <div key={product.MaSP} className="product-card-pro">
                <div className="product-card-pro__image-wrap">
                    {hasDiscount && (
                        <span className="product-card-pro__ribbon">-{percent}%</span>
                    )}
                    <img
                        className="product-card-pro__image"
                        src={`${import.meta.env.VITE_API_URL}/uploads/${product.HinhAnh}`}
                        alt={product.TenSP}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    />
                    <Link to={`/product/${product.MaSP}`} className="product-card-pro__quick-btn">
                        🔍 Xem chi tiết
                    </Link>
                </div>
                <div className="product-card-pro__body">
                    <h4 className="product-card-pro__name">{product.TenSP}</h4>
                    <div className="product-card-pro__price-row">
                        <span className="product-card-pro__price">
                            {Number(product.DonGia).toLocaleString()} đ
                        </span>
                        {hasDiscount && (
                            <span className="product-card-pro__price-old">
                                {Number(product.GiaGoc).toLocaleString()} đ
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {repurchase.length > 0 && (
                <section className="rec-section">
                    <div className="rec-header">
                        <h3 className="rec-heading">Có Thể Bạn Cần Mua Lại 🔄</h3>
                        <div className="rec-underline" />
                    </div>
                    <div className="rec-grid">
                        {repurchase.map(renderCard)}
                    </div>
                </section>
            )}

            {recommended.length > 0 && (
                <section className="rec-section">
                    <div className="rec-header">
                        <h3 className="rec-heading">Gợi Ý Dành Cho Bạn 🌿</h3>
                        <div className="rec-underline" />
                    </div>
                    <div className="rec-grid">
                        {recommended.map(renderCard)}
                    </div>
                </section>
            )}

            <style>{`
                .rec-section {
                    max-width: 1200px;
                    margin: 50px auto;
                    padding: 0 20px;
                }

                .rec-header {
                    margin-bottom: 24px;
                }

                .rec-heading {
                    font-family: 'Fraunces', Georgia, serif;
                    font-size: 26px;
                    font-weight: 600;
                    color: #1B4332;
                    margin: 0;
                }

                .rec-underline {
                    width: 64px;
                    height: 3px;
                    background: linear-gradient(90deg, #E9A23B, #B9603D);
                    margin-top: 10px;
                    border-radius: 2px;
                }

                .rec-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 24px;
                }

                @media (max-width: 900px) {
                    .rec-heading { font-size: 21px; }
                }
            `}</style>
        </>
    );
}