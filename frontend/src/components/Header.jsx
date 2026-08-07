import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const SEARCH_HISTORY_KEY = "ns_search_history";
const MAX_HISTORY = 8;

function Header() {
    const [keyword, setKeyword] = useState("");
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    // ===== LỊCH SỬ TÌM KIẾM =====
    const [searchHistory, setSearchHistory] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchWrapRef = useRef(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
        setSearchHistory(stored);
    }, []);

    // Đóng dropdown khi bấm ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const saveToHistory = (term) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        setSearchHistory(prev => {
            // Loại bỏ trùng (không phân biệt hoa thường), đưa từ mới lên đầu
            const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
            const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const removeHistoryItem = (term, e) => {
        e.stopPropagation();
        setSearchHistory(prev => {
            const updated = prev.filter(h => h !== term);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = (e) => {
        e.stopPropagation();
        setSearchHistory([]);
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    };

    const handleSuggestionClick = (term) => {
        setKeyword(term);
        saveToHistory(term);
        setShowSuggestions(false);
        navigate(`/products?search=${encodeURIComponent(term)}`);
    };

    // Lọc gợi ý: nếu đang gõ thì lọc theo từ khóa, chưa gõ gì thì hiện toàn bộ lịch sử
    const filteredSuggestions = keyword.trim()
        ? searchHistory.filter(h => h.toLowerCase().includes(keyword.trim().toLowerCase()))
        : searchHistory;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchUnreadCount(parsedUser.maTK);
            fetchCartCount(parsedUser.maTK); 
        } else {
            fetchCartCount(null);
        }

        const handleNotificationUpdate = () => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser) {
                fetchUnreadCount(currentUser.maTK);
            }
        };

        const handleCartUpdate = () => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            if (currentUser) {
                fetchCartCount(currentUser.maTK);
            } else {
                fetchCartCount(null);
            }
        };

        window.addEventListener('updateNotificationCount', handleNotificationUpdate);
        window.addEventListener('cartUpdated', handleCartUpdate); 

        return () => {
            window.removeEventListener('updateNotificationCount', handleNotificationUpdate);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

     useEffect(() => {
        if (!user) return;
        const timer = setInterval(() => {
            fetchUnreadCount(user.maTK);
            fetchCartCount(user.maTK);
        }, 30000);
        return () => clearInterval(timer);
    }, [user]);

    const fetchUnreadCount = (maTK) => {
        fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${maTK}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const count = data.filter(notif => !notif.DaDoc).length;
                    setUnreadCount(count);
                }
            })
            .catch(err => console.error("Lỗi đếm thông báo Header:", err));
    };

    const fetchCartCount = (maTK) => {
        if (maTK) {
            fetch(`${import.meta.env.VITE_API_URL}/api/cart/${maTK}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setCartCount(data.length); 
                    } else if (data && Array.isArray(data.items)) {
                        setCartCount(data.items.length);
                    }
                })
                .catch(err => console.error("Lỗi đếm giỏ hàng Header:", err));
        } else {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(localCart.length);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            saveToHistory(keyword.trim());
            setShowSuggestions(false);
            navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setUnreadCount(0);
        fetchCartCount(null); // Chuyển về đếm giỏ hàng của LocalStorage khi đăng xuất
        navigate("/");
    };

    return (
        <div
            className="d-flex justify-content-between align-items-center px-4"
            style={{
                backgroundColor: "#fff",
                borderBottom: "1px solid #f0ece2",
                boxShadow: "0 2px 12px rgba(27, 67, 50, 0.05)",
                gap: "20px",
                height: "var(--header-height)",
                boxSizing: "border-box",
            }}
        >
            <Link to="/" className="d-flex align-items-center text-decoration-none flex-shrink-0" style={{ gap: "8px" }}>
                <span style={{ fontSize: "26px" }}>🌱</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#1B4332" }}>
                    Nông Sản Shop
                </span>
            </Link>

            <div className="ns-search-wrap flex-grow-1" style={{ maxWidth: "500px", position: "relative" }} ref={searchWrapRef}>
                <form onSubmit={handleSearch} className="ns-search-form">
                    <input
                        type="text"
                        className="ns-search-input"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                    />
                    <button type="submit" className="ns-search-btn" aria-label="Tìm kiếm">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                            <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                        </svg>
                    </button>
                </form>

                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="ns-search-suggestions">
                        <div className="ns-search-suggestions__header">
                            <span>Tìm kiếm gần đây</span>
                            <button type="button" className="ns-search-suggestions__clear" onClick={clearHistory}>
                                Xóa tất cả
                            </button>
                        </div>
                        {filteredSuggestions.map((term) => (
                            <div
                                key={term}
                                className="ns-search-suggestion-item"
                                onClick={() => handleSuggestionClick(term)}
                            >
                                <span className="ns-search-suggestion-icon">🕐</span>
                                <span className="ns-search-suggestion-text">{term}</span>
                                <button
                                    type="button"
                                    className="ns-search-suggestion-remove"
                                    onClick={(e) => removeHistoryItem(term, e)}
                                    aria-label="Xóa mục này"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <nav className="d-flex align-items-center flex-shrink-0" style={{ gap: "25px" }}>
                <Link
                    to="/products"
                    className="text-decoration-none fw-medium"
                    style={{ color: "#333", fontSize: "15px" }}
                >
                    Sản phẩm
                </Link>

                <Link
                    to="/cart"
                    className="text-decoration-none fw-medium px-3 py-2"
                    style={{
                        background: "linear-gradient(135deg, #E9A23B, #B9603D)",
                        color: "#fff",
                        borderRadius: "20px",
                        fontSize: "14px",
                        boxShadow: "0 4px 12px rgba(185, 96, 61, 0.3)",
                        transition: "transform 0.2s",
                        position: "relative",
                        display: "inline-block"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    🛒 Giỏ hàng
                    {cartCount > 0 && (
                        <span 
                            style={{ 
                                position: "absolute",
                                top: "-5px", 
                                right: "-5px", 
                                backgroundColor: "#1B4332",
                                color: "white",
                                fontSize: "11px", 
                                fontWeight: "bold",
                                padding: "3px 6px",
                                borderRadius: "50%",
                                border: "2px solid #fff",
                                lineHeight: "1"
                            }}
                        >
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </Link>

                {user ? (
                    <>
                        <Link
                            to="/profile/thong-bao"
                            title="Thông báo"
                            style={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "40px",
                                height: "40px",
                                textDecoration: "none",
                                backgroundColor: "transparent",
                                background: "none",
                                border: "none",
                                outline: "none",
                                cursor: "pointer"
                            }}
                        >
                            <span style={{ fontSize: "22px", background: "transparent", lineHeight: "1" }}>🔔</span>
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "0px",
                                        right: "0px",
                                        backgroundColor: "#B9603D",
                                        color: "white",
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                        padding: "3px 5px",
                                        borderRadius: "50%",
                                        border: "2px solid #fff",
                                        lineHeight: "1"
                                    }}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/profile"
                            title="Trang cá nhân"
                            className="d-flex align-items-center justify-content-center"
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                backgroundColor: "#FBF1DE",
                                color: "#1B4332",
                                textDecoration: "none",
                                fontSize: "18px",
                                border: "1px solid #E9A23B",
                            }}
                        >
                            👤
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="px-3 py-2"
                            style={{
                                backgroundColor: "transparent",
                                color: "#B9603D",
                                borderRadius: "20px",
                                border: "1.5px solid #B9603D",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#B9603D";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#B9603D";
                            }}
                        >
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-decoration-none fw-medium px-3 py-2"
                            style={{
                                color: "#1B4332",
                                fontSize: "14px",
                                fontWeight: "500",
                                border: "1.5px solid #1B4332",
                                borderRadius: "20px",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#1B4332";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#1B4332";
                            }}
                        >
                            Đăng nhập
                        </Link>

                        <Link
                            to="/register"
                            className="text-decoration-none fw-medium px-3 py-2"
                            style={{
                                background: "linear-gradient(135deg, #2D6A4F, #1B4332)",
                                color: "#fff",
                                borderRadius: "20px",
                                fontSize: "14px",
                                fontWeight: "500",
                                boxShadow: "0 2px 8px rgba(27, 67, 50, 0.3)",
                            }}
                        >
                            Đăng ký
                        </Link>
                    </>
                )}
            </nav>

            <style>{`
                .ns-search-form {
                    display: flex;
                    align-items: center;
                    background: #fff;
                    border: 1.5px solid #e2e6e2;
                    border-radius: 999px;
                    overflow: hidden;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .ns-search-form:hover {
                    border-color: #c9d6c9;
                }

                .ns-search-form:focus-within {
                    border-color: #2e7d32;
                    box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.12);
                }

                .ns-search-input {
                    flex: 1;
                    min-width: 0;
                    padding: 11px 18px;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    background: transparent;
                    color: #333;
                }

                .ns-search-input::placeholder {
                    color: #9aa39a;
                }

                .ns-search-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    margin: 3px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #43a047, #1b5e20);
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
                }

                .ns-search-btn:hover {
                    transform: scale(1.07);
                    box-shadow: 0 4px 12px rgba(27, 94, 32, 0.35);
                    filter: brightness(1.05);
                }

                .ns-search-btn:active {
                    transform: scale(0.96);
                }

                /* ===== DROPDOWN GỢI Ý LỊCH SỬ TÌM KIẾM ===== */
                .ns-search-suggestions {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: #fff;
                    border-radius: 14px;
                    border: 1px solid #eef1ee;
                    box-shadow: 0 16px 32px rgba(27, 67, 50, 0.14);
                    overflow: hidden;
                    z-index: 50;
                    animation: ns-suggest-in 0.15s ease;
                }

                @keyframes ns-suggest-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .ns-search-suggestions__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 16px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #7a8a7a;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    background: #FBF1DE;
                }

                .ns-search-suggestions__clear {
                    background: none;
                    border: none;
                    color: #B9603D;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    text-transform: none;
                    letter-spacing: 0;
                    padding: 0;
                }

                .ns-search-suggestions__clear:hover {
                    text-decoration: underline;
                }

                .ns-search-suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .ns-search-suggestion-item:hover {
                    background: #f1f8f1;
                }

                .ns-search-suggestion-icon {
                    font-size: 13px;
                    opacity: 0.5;
                    flex-shrink: 0;
                }

                .ns-search-suggestion-text {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ns-search-suggestion-remove {
                    background: none;
                    border: none;
                    color: #aaa;
                    font-size: 12px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    transition: background 0.15s ease, color 0.15s ease;
                }

                .ns-search-suggestion-remove:hover {
                    background: #fde8e8;
                    color: #B9603D;
                }
            `}</style>
        </div>
    );
}

export default Header;