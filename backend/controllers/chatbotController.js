const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const multer = require("multer");
const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
const calculatePrice = require("../utils/priceCalculator");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const imageAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multer lưu tạm trong RAM (không cần lưu ổ đĩa, chỉ dùng để gửi cho Gemini)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // tối đa 5MB

const extractKeywords = (message) => {
    const stopWords = [
        "shop", "có", "không", "bán", "giá", "bao", "nhiêu", "cho", "mình",
        "tôi", "muốn", "mua", "là", "gì", "ạ", "vậy", "à", "nào", "loại",
        "như", "thế", "sao", "ra", "sao", "được", "vậy", "hả", "hử", "này"
    ];
    const cleanMessage = message.replace(/[.,?!]/g, "");

    return cleanMessage
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.includes(word))
        .join(" ");
};

const detectImageGenerationIntent = (message) => {
    const triggers = [
        "hình ảnh", "hình minh họa", "cho xem hình", "vẽ", "minh họa",
        "trông như thế nào", "trông ra sao", "món ăn từ", "công thức",
        "làm món", "cách chế biến", "cách làm", "gợi ý món"
    ];
    const lower = message.toLowerCase();
    return triggers.some(t => lower.includes(t));
};

const generateIllustrationImage = async (prompt) => {
    try {
        const result = await imageAI.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: `Tạo một ảnh minh họa đẹp, chân thực, phong cách ẩm thực/nông sản tươi cho: ${prompt}. Ảnh chụp gần, ánh sáng tự nhiên, không chữ, không watermark.`,
        });

        const parts = result.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(p => p.inlineData);

        if (imagePart) {
            return {
                base64: imagePart.inlineData.data,
                mimeType: imagePart.inlineData.mimeType || "image/png"
            };
        }
        return null;
    } catch (error) {
        console.error("Lỗi tạo ảnh AI:", error?.message || error);
        return null;
    }
};

// Tách logic build context sản phẩm (dùng chung cho ask() và askImage())
const buildProductContext = (relatedProducts, reviewMap) => {
    if (relatedProducts.length === 0) {
        return "Không tìm thấy sản phẩm nào khớp trực tiếp với câu hỏi này trong kho.";
    }

    return relatedProducts.map(p => {
        const finalPrice = calculatePrice(p);
        const isDiscounted = p.TuDongGiamGia && finalPrice < p.GiaGoc;

        const priceInfo = isDiscounted
            ? `Giá gốc: ${Number(p.GiaGoc).toLocaleString()}đ, giá hiện tại: ${Number(finalPrice).toLocaleString()}đ (đang giảm ${Math.round((1 - finalPrice / p.GiaGoc) * 100)}%)`
            : `Giá: ${Number(finalPrice).toLocaleString()}đ`;

        const stockStatus = p.SoLuongTon > 0
            ? `Còn hàng (${p.SoLuongTon} ${p.DonViTinh})`
            : "TẠM HẾT HÀNG";

        const review = reviewMap[p.MaSP];
        const reviewInfo = review
            ? `Đánh giá: ${review.diemTrungBinh}⭐ (${review.soLuotDanhGia} lượt)${
                review.nhanXetTieuBieu.length > 0
                    ? ` - Khách nhận xét: ${review.nhanXetTieuBieu.map(c => `"${c}"`).join(", ")}`
                    : ""
              }`
            : "Đánh giá: Chưa có lượt đánh giá nào";

        return `- ${p.TenSP} (Danh mục: ${p.TenDM}) - ${priceInfo}/${p.DonViTinh} - Tình trạng: ${stockStatus} - ${reviewInfo} - Mô tả: ${p.MoTa || "Không có mô tả"}`;
    }).join("\n");
};

// Tìm sản phẩm liên quan + đánh giá, dùng chung cho ask() và askImage()
const findRelatedProductsAndReviews = async (searchText) => {
    let relatedProducts = [];
    try {
        const keyword = extractKeywords(searchText);
        if (keyword) {
            relatedProducts = await productModel.searchProducts(keyword, 5);
        }
    } catch (dbError) {
        console.error("Lỗi tìm sản phẩm cho chatbot:", dbError);
    }

    let reviewMap = {};
    try {
        if (relatedProducts.length > 0) {
            const maSPList = relatedProducts.map(p => p.MaSP);
            const reviewSummaries = await reviewModel.getReviewSummaryForProducts(maSPList);
            reviewMap = reviewSummaries.reduce((acc, r) => {
                acc[r.MaSP] = r;
                return acc;
            }, {});
        }
    } catch (reviewError) {
        console.error("Lỗi lấy đánh giá cho chatbot:", reviewError);
    }

    return { relatedProducts, reviewMap };
};

const ask = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
        }

        const { relatedProducts, reviewMap } = await findRelatedProductsAndReviews(message);
        const productContext = buildProductContext(relatedProducts, reviewMap);

        const systemPrompt = `
Bạn là trợ lý ảo tư vấn bán hàng của "Nông Sản Shop" - một cửa hàng bán thực phẩm nông sản sạch trực tuyến.

Nhiệm vụ của bạn:
- Tư vấn, gợi ý sản phẩm nông sản phù hợp với nhu cầu khách hàng.
- Trả lời các câu hỏi hỗ trợ chung: cách đặt hàng, chính sách đổi trả, giao hàng, thanh toán... (trả lời chung chung, hợp lý nếu không có thông tin chính sách cụ thể).
- Luôn trả lời bằng tiếng Việt, giọng điệu thân thiện, ngắn gọn, dễ hiểu.
- Nếu khách hỏi về sản phẩm, ưu tiên dùng thông tin sản phẩm liên quan bên dưới (nếu có) để trả lời chính xác về giá, khuyến mãi, tồn kho.
- Nếu sản phẩm đang "đang giảm X%", hãy chủ động nhắc khách biết để khuyến khích mua ngay.
- Nếu sản phẩm có trong danh sách nhưng ghi "TẠM HẾT HÀNG", hãy báo khách đúng là sản phẩm đang tạm hết hàng (KHÔNG phải là sản phẩm không tồn tại), và có thể gợi ý sản phẩm khác còn hàng thay thế nếu phù hợp.
- Nếu không có sản phẩm phù hợp trong danh sách, hãy nói thật rằng cửa hàng hiện chưa có sản phẩm đó, đừng bịa ra sản phẩm không tồn tại.
- Nếu sản phẩm có thông tin đánh giá từ khách hàng thật (điểm trung bình, số lượt, nhận xét), hãy chủ động dùng thông tin này để tăng độ tin cậy khi tư vấn. CHỈ dùng đúng những nhận xét được cung cấp, KHÔNG bịa thêm nhận xét hay điểm số không có trong dữ liệu.
- Nếu sản phẩm ghi "Chưa có lượt đánh giá nào", đừng bịa ra đánh giá; có thể nói sản phẩm còn khá mới, chưa có review nhưng vẫn đảm bảo chất lượng.
- Không trả lời các câu hỏi ngoài phạm vi cửa hàng nông sản (chính trị, y tế chuyên sâu...), hãy lịch sự từ chối và hướng khách quay lại chủ đề mua sắm.

Danh sách sản phẩm liên quan tìm thấy trong kho (nếu có):
${productContext}
        `.trim();

        const historyText = Array.isArray(history)
            ? history.slice(0, -1).map(h => `${h.role === "user" ? "Khách" : "Trợ lý"}: ${h.content}`).join("\n")
            : "";

        const fullPrompt = `${systemPrompt}\n\n${historyText ? "Lịch sử hội thoại:\n" + historyText + "\n\n" : ""}Câu hỏi hiện tại của khách: ${message}`;

        let reply;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent(fullPrompt);
            reply = result.response.text();
        } catch (aiError) {
            console.error("Lỗi gọi Gemini API:", aiError?.message || aiError);
            return res.status(500).json({
                message: "Không thể kết nối tới AI. Vui lòng kiểm tra lại API key hoặc kết nối mạng."
            });
        }

        const productImages = relatedProducts
            .filter(p => p.HinhAnh)
            .slice(0, 3)
            .map(p => ({
                maSP: p.MaSP,
                tenSP: p.TenSP,
                hinhAnh: p.HinhAnh
            }));

        let generatedImage = null;
        if (detectImageGenerationIntent(message)) {
            generatedImage = await generateIllustrationImage(message);
        }

        res.status(200).json({ reply, productImages, generatedImage });

    } catch (error) {
        console.error("Lỗi chatbot:", error?.message || error);
        res.status(500).json({ message: "Trợ lý ảo đang gặp sự cố, vui lòng thử lại sau." });
    }
};

// ==================== KHÁCH GỬI ẢNH -> NHẬN DIỆN -> GỢI Ý SẢN PHẨM ====================
const askImage = async (req, res) => {
    try {
        const { message } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Vui lòng gửi kèm ảnh" });
        }

        const base64Image = file.buffer.toString("base64");
        const mimeType = file.mimetype;

        // 1. Dùng Gemini nhận diện nội dung ảnh
        let imageDescription = "";
        try {
            const visionModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const visionResult = await visionModel.generateContent([
                { inlineData: { data: base64Image, mimeType } },
                {
                    text: "Đây là ảnh khách hàng gửi cho shop nông sản. Hãy cho biết ngắn gọn (1 câu) đây là loại nông sản/thực phẩm gì, nêu tên cụ thể nếu nhận ra được. Chỉ trả lời tên/mô tả, không chào hỏi thêm."
                }
            ]);
            imageDescription = visionResult.response.text().trim();
        } catch (visionError) {
            console.error("Lỗi nhận diện ảnh:", visionError?.message || visionError);
            return res.status(500).json({ message: "Không thể nhận diện ảnh, vui lòng thử lại." });
        }

        // 2. Tìm sản phẩm liên quan dựa trên mô tả ảnh (+ tin nhắn kèm nếu có)
        const searchText = `${imageDescription} ${message || ""}`.trim();
        const { relatedProducts, reviewMap } = await findRelatedProductsAndReviews(searchText);
        const productContext = buildProductContext(relatedProducts, reviewMap);

        // 3. Sinh câu trả lời tư vấn dựa trên nội dung ảnh + sản phẩm tìm được
        const systemPrompt = `
Bạn là trợ lý ảo tư vấn bán hàng của "Nông Sản Shop".
Khách vừa gửi 1 tấm ảnh. Bạn đã nhận diện ảnh đó là: "${imageDescription}".
${message ? `Khách có nhắn kèm: "${message}"` : ""}

Nhiệm vụ:
- Cho khách biết bạn nhận ra ảnh đó là gì.
- Nếu có sản phẩm liên quan trong danh sách bên dưới, giới thiệu và tư vấn (giá, tồn kho, khuyến mãi, đánh giá nếu có).
- Nếu không có sản phẩm khớp, báo khách shop hiện chưa có sản phẩm này, đừng bịa.
- Trả lời tiếng Việt, thân thiện, ngắn gọn.

Danh sách sản phẩm liên quan tìm thấy trong kho (nếu có):
${productContext}
        `.trim();

        let reply;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent(systemPrompt);
            reply = result.response.text();
        } catch (aiError) {
            console.error("Lỗi gọi Gemini API:", aiError?.message || aiError);
            return res.status(500).json({ message: "Không thể kết nối tới AI." });
        }

        const productImages = relatedProducts
            .filter(p => p.HinhAnh)
            .slice(0, 3)
            .map(p => ({
                maSP: p.MaSP,
                tenSP: p.TenSP,
                hinhAnh: p.HinhAnh
            }));

        res.status(200).json({ imageDescription, reply, productImages });

    } catch (error) {
        console.error("Lỗi askImage:", error?.message || error);
        res.status(500).json({ message: "Trợ lý ảo đang gặp sự cố, vui lòng thử lại sau." });
    }
};

module.exports = { ask, askImage, uploadMiddleware: upload };