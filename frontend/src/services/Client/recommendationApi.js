import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/recommendations`;

// Gợi ý sản phẩm cá nhân hóa theo lịch sử mua
export const getPersonalizedRecommendations = (maTK) => {
    return axios.get(`${API_URL}/${maTK}`);
};

// Nhắc mua lại sản phẩm đã mua > 5 ngày
export const getRepurchaseReminders = (maTK) => {
    return axios.get(`${API_URL}/repurchase/${maTK}`);
};