function calculatePrice(product) {
    // Nếu sản phẩm không bật tự động giảm giá, trả về giá gốc ngay lập tức
    if (!product.TuDongGiamGia) {
        return product.GiaGoc;
    }

    const now = new Date();

    // ---------------------------------------------------------
    // LOGIC 1: DÀNH CHO HÀNG TRONG NGÀY (Giảm theo giờ)
    // ---------------------------------------------------------
    if (product.LoaiHang === 'Trong ngày') {
        const hour = now.getHours() + now.getMinutes() / 60;
        const startHour = 7;
        const endHour = 21;

        let progress = (hour - startHour) / (endHour - startHour);
        progress = Math.max(0, Math.min(1, progress));

        const discount = product.GiamToiDa * progress;
        const finalPrice = product.GiaGoc * (1 - discount / 100);

        return Math.round(finalPrice);
    }

    // ---------------------------------------------------------
    // LOGIC 2: DÀNH CHO HÀNG DÀI HẠN (Giảm khi cận date)
    // ---------------------------------------------------------
    if (product.LoaiHang === 'Dài hạn' && product.HanSuDung) {
        const hsd = new Date(product.HanSuDung);
        
        // Tính khoảng cách giữa HSD và ngày hiện tại (tính bằng ngày)
        const diffTime = hsd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Nếu còn từ 0 đến 7 ngày -> Kích hoạt mức giảm tối đa để xả hàng
        if (diffDays >= 0 && diffDays <= 7) {
            const discount = product.GiamToiDa || 50; // Ưu tiên GiamToiDa thiết lập trong DB, mặc định 50%
            const finalPrice = product.GiaGoc * (1 - discount / 100);
            return Math.round(finalPrice);
        }
    }

    // Nếu là hàng dài hạn nhưng chưa cận date (hoặc thiếu data), giữ nguyên giá gốc
    return product.GiaGoc;
}

module.exports = calculatePrice;