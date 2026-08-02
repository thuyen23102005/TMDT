import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/orders`;

// Sửa hàm getOrders để nhận object params
export const getOrders = (params) => axios.get(API, { params });

export const getOrderDetail = (id) => axios.get(`${API}/${id}`);

export const updateOrderStatus = (id, data) =>
    axios.put(
        `${API}/${id}/status`,
        data
    );