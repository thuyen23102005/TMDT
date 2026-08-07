import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/return-requests`;

// Lấy danh sách yêu cầu đổi/trả (có thể lọc theo status qua params)
export const getReturnRequests = (params) => axios.get(API, { params });

// Lấy chi tiết 1 yêu cầu đổi/trả
export const getReturnRequestDetail = (id) => axios.get(`${API}/${id}`);

// Cập nhật trạng thái: approved / rejected / completed
export const updateReturnRequestStatus = (id, data) =>
    axios.put(`${API}/${id}/status`, data);