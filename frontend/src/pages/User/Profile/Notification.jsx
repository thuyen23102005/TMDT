import React, { useState } from 'react';

function Notification() {
    // Dữ liệu mẫu (mock data) - Sau này bạn thay bằng fetch API
    const [notifications, setNotifications] = useState([
        { 
            id: 1, 
            type: 'order', 
            title: 'Đơn hàng đang được giao', 
            content: 'Đơn hàng #8 của bạn đang trên đường giao đến. Vui lòng chú ý điện thoại để nhận hàng nhé.', 
            time: '10 phút trước', 
            isRead: false 
        },
        { 
            id: 2, 
            type: 'point', 
            title: 'Cộng điểm thưởng thành công', 
            content: 'Bạn vừa được cộng thêm 12,400 điểm từ việc hoàn thành đơn hàng. Tổng điểm hiện tại: 12,400 điểm.', 
            time: '2 giờ trước', 
            isRead: false 
        },
        { 
            id: 3, 
            type: 'voucher', 
            title: 'Voucher sắp hết hạn!', 
            content: 'Mã giảm giá 50K của bạn sẽ hết hạn trong 24 giờ tới. Nhanh tay vào ví voucher sử dụng ngay kẻo lỡ!', 
            time: '1 ngày trước', 
            isRead: true 
        },
        { 
            id: 4, 
            type: 'account', 
            title: 'Cập nhật mật khẩu thành công', 
            content: 'Mật khẩu tài khoản của bạn đã được thay đổi an toàn.', 
            time: '2 ngày trước', 
            isRead: true 
        },
        { 
            id: 5, 
            type: 'voucher', 
            title: 'Tặng bạn mã giảm giá mới', 
            content: 'Chúc mừng bạn nhận được mã giảm giá FREESHIP cho đơn từ 100K. Nhập mã: FREESHIP100.', 
            time: '3 ngày trước', 
            isRead: true 
        }
    ]);

    // Hàm đánh dấu đã đọc tất cả
    const markAllAsRead = () => {
        const updated = notifications.map(notif => ({ ...notif, isRead: true }));
        setNotifications(updated);
    };

    // Hàm lấy icon và màu sắc tùy theo loại thông báo
    const getIconAndColor = (type) => {
        switch (type) {
            case 'order': return { icon: '📦', color: '#17a2b8', bg: '#e0f7fa' }; // Xanh dương
            case 'point': return { icon: '💎', color: '#ffc107', bg: '#fff8e1' }; // Vàng
            case 'voucher': return { icon: '🎟️', color: '#e91e63', bg: '#fce4ec' }; // Hồng
            case 'account': return { icon: '🔒', color: '#28a745', bg: '#e8f5e9' }; // Xanh lá
            default: return { icon: '🔔', color: '#6c757d', bg: '#f8f9fa' };
        }
    };

    return (
        <div className="bg-white rounded-4 p-4 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-success fw-bold mb-0">Thông báo của bạn</h5>
                <button 
                    onClick={markAllAsRead} 
                    className="btn btn-sm btn-outline-success"
                    style={{ borderRadius: '20px' }}
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
                        const { icon, color, bg } = getIconAndColor(notif.type);
                        return (
                            <div 
                                key={notif.id} 
                                className={`list-group-item d-flex align-items-start py-3 px-3 mb-2 rounded-3 border ${notif.isRead ? 'bg-white' : ''}`}
                                style={{ 
                                    backgroundColor: notif.isRead ? '#fff' : '#f4fbf5',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                {/* Icon */}
                                <div 
                                    className="d-flex justify-content-center align-items-center rounded-circle flex-shrink-0"
                                    style={{ width: '50px', height: '50px', backgroundColor: bg, fontSize: '24px' }}
                                >
                                    {icon}
                                </div>
                                
                                {/* Nội dung */}
                                <div className="ms-3 flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className={`mb-0 ${notif.isRead ? 'text-dark' : 'fw-bold text-success'}`}>
                                            {notif.title}
                                        </h6>
                                        <small className="text-muted" style={{ fontSize: '12px' }}>
                                            {notif.time}
                                        </small>
                                    </div>
                                    <p className="mb-0 text-secondary" style={{ fontSize: '14px' }}>
                                        {notif.content}
                                    </p>
                                </div>

                                {/* Chấm đỏ báo chưa đọc */}
                                {!notif.isRead && (
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