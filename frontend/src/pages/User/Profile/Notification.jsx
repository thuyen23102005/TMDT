import React, { useState, useEffect } from 'react';

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [now, setNow] = useState(new Date()); 

    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Lấy dữ liệu từ API
    useEffect(() => {
        if (storedUser) {
            fetch(`http://localhost:5000/api/notifications/${storedUser.maTK}`)
                .then(res => res.json())
                .then(data => {
                    setNotifications(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    // Hẹn giờ tự động cập nhật thời gian (now) mỗi 1 phút
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Hàm gọi API đánh dấu đã đọc
    const handleMarkAllAsRead = async () => {
        if (!storedUser) return;
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/read-all/${storedUser.maTK}`, {
                method: 'PUT'
            });
            if (res.ok) {
                // Cập nhật giao diện bên dưới
                const updated = notifications.map(notif => ({ ...notif, DaDoc: true }));
                setNotifications(updated);

                // PHÁT TÍN HIỆU TOÀN CỤC: Yêu cầu Header cập nhật lại chuông ngay lập tức!
                window.dispatchEvent(new Event('updateNotificationCount'));
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật thông báo:", error);
        }
    };

    // HÀM TÍNH THỜI GIAN THEO LOGIC MỚI
    const timeAgo = (dateString) => {
        if (!dateString) return "Vừa xong";

        let notifDate = new Date(dateString);
        
        if (notifDate > now) {
            const offsetMs = now.getTimezoneOffset() * 60 * 1000; 
            notifDate = new Date(notifDate.getTime() + offsetMs); 
            if (notifDate > now) notifDate = now; 
        }

        const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const diffDays = Math.floor((today - notifDay) / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            const day = String(notifDate.getDate()).padStart(2, '0');
            const month = String(notifDate.getMonth() + 1).padStart(2, '0');
            const year = notifDate.getFullYear();
            return `${day}/${month}/${year}`;
        } else if (diffDays >= 1) {
            return `${diffDays} ngày trước`;
        } else {
            const diffMs = now - notifDate;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);

            if (diffHours >= 1) {
                return `${diffHours} giờ trước`;
            } else if (diffMinutes >= 1) {
                return `${diffMinutes} phút trước`;
            } else {
                return "Vừa xong";
            }
        }
    };

    const getIconAndColor = (type) => {
        switch (type) {
            case 'order': return { icon: '📦', color: '#17a2b8', bg: '#e0f7fa' };
            case 'point': return { icon: '💎', color: '#ffc107', bg: '#fff8e1' };
            case 'voucher': return { icon: '🎟️', color: '#e91e63', bg: '#fce4ec' };
            case 'account': return { icon: '🔒', color: '#28a745', bg: '#e8f5e9' };
            default: return { icon: '🔔', color: '#6c757d', bg: '#f8f9fa' };
        }
    };

    if (!storedUser) return <p className="text-center mt-4 text-danger">Vui lòng đăng nhập để xem thông báo.</p>;
    if (isLoading) return <p className="text-center mt-4">Đang tải...</p>;

    return (
        <div className="bg-white rounded-4 p-4 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-success fw-bold mb-0">Thông báo của bạn</h5>
                <button 
                    onClick={handleMarkAllAsRead} 
                    className="btn btn-sm btn-outline-success"
                    style={{ borderRadius: '20px' }}
                    disabled={notifications.length === 0 || notifications.every(n => n.DaDoc)}
                >
                    ✓ Đánh dấu đã đọc tất cả
                </button>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center p-5 text-muted">
                    <p style={{ fontSize: '40px' }}>📭</p>
                    <p>Bạn chưa có thông báo nào.</p>
                </div>
            ) : (
                <div className="list-group list-group-flush">
                    {notifications.map((notif) => {
                        const { icon, color, bg } = getIconAndColor(notif.Loai);
                        return (
                            <div 
                                key={notif.MaTB} 
                                className={`list-group-item d-flex align-items-start py-3 px-3 mb-2 rounded-3 border ${notif.DaDoc ? 'bg-white' : ''}`}
                                style={{ 
                                    backgroundColor: notif.DaDoc ? '#fff' : '#f4fbf5',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                <div 
                                    className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                                    style={{ width: '50px', height: '50px', backgroundColor: bg, fontSize: '24px' }}
                                >
                                    {icon}
                                </div>
                                
                                <div className="ms-3 flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className={`mb-0 ${notif.DaDoc ? 'text-dark' : 'fw-bold text-success'}`}>
                                            {notif.TieuDe}
                                        </h6>
                                        <small className="text-muted" style={{ fontSize: '12px' }}>
                                            {timeAgo(notif.NgayTao)}
                                        </small>
                                    </div>
                                    <p className="mb-0 text-secondary" style={{ fontSize: '14px' }}>
                                        {notif.NoiDung}
                                    </p>
                                </div>

                                {!notif.DaDoc && (
                                    <div 
                                        className="rounded-circle bg-danger ms-2 mt-2" 
                                        style={{ width: '8px', height: '8px' }}
                                    ></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Notification;