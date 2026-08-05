const reviewModel = require("../models/reviewModel");
const notificationModel = require("../models/notificationModel");
const { connectDB, sql } = require("../config/db"); 

const getByProduct = async (req, res) => {
    try {
        const reviews = await reviewModel.getReviewsByProduct(req.params.maSP);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getByUser = async (req, res) => {
    try {
        const reviews = await reviewModel.getReviewsByUser(req.params.maTK);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

const checkEligibility = async (req, res) => {
    try {
        const { maTK, maSP } = req.params;
        const canReview = await reviewModel.checkCanReview(maTK, maSP);
        res.json({ canReview });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

const addReview = async (req, res) => {
    try {
        // Nhận thêm biến maDH từ Frontend gửi lên
        const { maTK, maSP, maDH, soSao, noiDung } = req.body; 
        
        const canReview = await reviewModel.checkCanReview(maTK, maSP);
        if (!canReview) {
            return res.status(403).json({ message: "Bạn phải mua sản phẩm này mới được đánh giá." });
        }

        // Truyền thêm maDH vào model để lưu xuống DB
        await reviewModel.createReview(maTK, maSP, maDH, soSao, noiDung);

        // -- TẠO THÔNG BÁO TỰ ĐỘNG --
        try {
            const pool = await connectDB();
            const spResult = await pool.request()
                .input("MaSP", sql.Int, maSP)
                .query("SELECT TenSP FROM SanPham WHERE MaSP = @MaSP");
                
            let tenSP = "sản phẩm";
            if (spResult.recordset.length > 0) {
                tenSP = spResult.recordset[0].TenSP;
            }

            await notificationModel.createNotification(
                maTK, 
                'point', 
                'Đánh giá thành công 🌟', 
                `Cảm ơn bạn đã đánh giá ${soSao} sao cho "${tenSP}". Đóng góp của bạn giúp Nông Sản Shop ngày càng hoàn thiện hơn!`
            );
        } catch (notifyErr) {
            console.error("Lỗi khi tạo thông báo đánh giá:", notifyErr);
        }

        res.status(201).json({ message: "Đánh giá thành công!" });
    } catch (error) {
        console.error("LỖI BE ĐÁNH GIÁ:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { getByProduct, getByUser, checkEligibility, addReview };