const orderModel = require("../models/orderModel");
const notificationModel = require("../models/notificationModel"); 
const { connectDB, sql } = require("../config/db");
const { sendEmail } = require("../utils/emailService");

const getAllOrders = async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;
        const orders = await orderModel.getAllOrders(status, fromDate, toDate);
        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ĐÃ CẬP NHẬT: Trả về cả thông tin đơn hàng và danh sách sản phẩm cho trang OrderDetail
const getOrderDetail = async (req, res) => {
    try {
        const orderId = req.params.id;
        const pool = await connectDB();

        // 1. Lấy thông tin chung đơn hàng & người nhận
        const orderInfoQuery = await pool.request()
            .input("MaDH", sql.Int, orderId)
            .query(`
                SELECT 
                    dh.MaDH, dh.NgayDat, dh.PhiVanChuyen, dh.TongTien, 
                    dh.TrangThaiDonHang, dh.TrangThaiThanhToan,
                    dc.HoTen AS NguoiNhan, dc.SoDienThoai, dc.DiaChiChiTiet
                FROM DonHang dh
                LEFT JOIN SoDiaChi dc ON dh.MaDC = dc.MaDC
                WHERE dh.MaDH = @MaDH
            `);

        if (orderInfoQuery.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // 2. Lấy chi tiết các sản phẩm trong đơn
        const itemsQuery = await pool.request()
            .input("MaDH", sql.Int, orderId)
            .query(`
                SELECT
                    sp.MaSP, sp.HinhAnh, sp.TenSP,
                    ct.SoLuong, ct.DonGia, ct.ThanhTien
                FROM ChiTietDonHang ct
                INNER JOIN SanPham sp ON ct.MaSP = sp.MaSP
                WHERE ct.MaDH = @MaDH
            `);

        res.json({
            order: orderInfoQuery.recordset[0],
            items: itemsQuery.recordset
        });
    } catch (err) {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const newStatus = req.body.TrangThaiDonHang;
        const newPaymentStatus = req.body.TrangThaiThanhToan;

        const currentOrder = await orderModel.getOrderStatusById(orderId);
        
        if (newStatus === "Đã hủy" && currentOrder.TrangThaiThanhToan === "Đã thanh toán") {
            return res.status(400).json({ message: "Đơn hàng đã thanh toán không thể hủy." });
        }
        if (!currentOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const currentStatus = currentOrder.TrangThaiDonHang;
        await orderModel.updateStatus(orderId, newStatus, newPaymentStatus);

        try {
            const pool = await connectDB();
            
            const userResult = await pool.request()
                .input('MaDH', sql.Int, orderId)
                .query(`
                    SELECT tk.Email, kh.HoTen, kh.MaTK 
                    FROM DonHang dh
                    JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                    JOIN TaiKhoan tk ON kh.MaTK = tk.MaTK
                    WHERE dh.MaDH = @MaDH
                `);

            if (userResult.recordset.length > 0) {
                const { Email, HoTen, MaTK } = userResult.recordset[0]; 
                let title = "";
                let content = "";

                if (newStatus === "Đã hủy" && currentStatus !== "Đã hủy") {
                    title = "Đơn hàng đã bị hủy ❌";
                    content = `Đơn hàng #${orderId} của bạn đã được hủy.`;
                } else if (newStatus === "Đã xác nhận" && currentStatus !== "Đã xác nhận") {
                    title = "Đơn hàng đã được xác nhận ✅";
                    content = `Đơn hàng #${orderId} của bạn đã được cửa hàng xác nhận và đang đóng gói.`;
                } else if (newStatus === "Đang giao" && currentStatus !== "Đang giao") {
                    title = "Đơn hàng đang được giao 🚚";
                    content = `Đơn hàng #${orderId} của bạn đang trên đường giao đến. Vui lòng chú ý điện thoại nhé.`;
                } else if (newStatus === "Đã giao" && currentStatus !== "Đã giao") {
                    title = "Giao hàng thành công 🎉";
                    content = `Đơn hàng #${orderId} đã được giao thành công. Cảm ơn bạn đã tin tưởng mua sắm!`;
                }

                if (title !== "") {
                    await notificationModel.createNotification(MaTK, 'order', title, content);

                    if (Email) {
                        const orderTrackingLink = `http://localhost:5173/order-detail/${orderId}`;
                        const htmlTemplate = `
                            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f9f5; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #2e7d32;">Xin chào ${HoTen || 'Quý khách'},</h2>
                                <p style="font-size: 16px; color: #333;">${content}</p>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="${orderTrackingLink}" target="_blank" style="background-color: #2e7d32; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px; display: inline-block;">
                                        🔍 Xem chi tiết đơn hàng #${orderId}
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                                <p style="font-size: 13px; color: #777;">Cảm ơn bạn đã lựa chọn sản phẩm tại <strong>Nông Sản Shop</strong>!</p>
                            </div>
                        `;
                        await sendEmail(Email, `[Nông Sản Shop] ${title}`, htmlTemplate);
                    }
                }
            }
        } catch (notifyErr) {
            console.error("Lỗi gửi thông báo/email:", notifyErr);
        }

        res.json({ message: "Cập nhật thành công" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái" });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const orders = await orderModel.getOrdersByUser(req.params.maTK);
        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const data = await orderModel.getPaymentStatusById(req.params.id);
        res.json(data || { TrangThaiThanhToan: null });
    } catch (error) {
        console.error("Lỗi lấy trạng thái thanh toán:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    getAllOrders,
    getOrderDetail,
    updateStatus,
    getOrdersByUser,
    getPaymentStatus
};