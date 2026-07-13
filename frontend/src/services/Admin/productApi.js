import axios from "axios";

const API = "http://localhost:5000/api/products";

export const getProducts = (page, limit = 5) =>
    axios.get(`${API}?page=${page}&limit=${limit}`);
export const getAllProducts = () =>
    axios.get(`${API}/all`);
export const createProduct = (data) =>
    axios.post(API, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

export const updateProduct = (id, data) =>
    axios.put(`${API}/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

export const deleteProduct = (id) =>
    axios.delete(`${API}/${id}`);