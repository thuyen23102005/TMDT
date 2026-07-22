const orderModel = require("../models/orderModel");

// Tách MaDH từ nội dung chuyển khoản, ví dụ "DH14 thanh toan don hang"
function extractMaDH(content) {
    const match = String(content).match(/DH(\d+)/i);
    return match ? parseInt(match[1]) : null;
}

// Nhận webhook từ SePay khi có giao dịch chuyển khoản vào tài khoản
const sepayWebhook = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const expectedKey = `Apikey ${process.env.SEPAY_API_KEY}`;
        if (!process.env.SEPAY_API_KEY || authHeader !== expectedKey) {
            console.error("SePay webhook: sai hoặc thiếu API key");
            return res.status(401).json({ success: false });
        }

        const { content, transferType } = req.body;

        if (transferType !== "in") {
            return res.status(200).json({ success: true });
        }

        const maDH = extractMaDH(content);
        if (!maDH) {
            console.error("SePay webhook: không đọc được MaDH từ nội dung:", content);
            return res.status(200).json({ success: true });
        }

        await orderModel.updatePaymentStatus(maDH, "Đã thanh toán");
        console.log(`SePay webhook: đã cập nhật đơn hàng #${maDH} sang Đã thanh toán`);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Lỗi xử lý webhook SePay:", error);
        res.status(500).json({ success: false });
    }
};

module.exports = { sepayWebhook };