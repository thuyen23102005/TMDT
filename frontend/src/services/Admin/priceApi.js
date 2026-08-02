import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/products/prices`;

export const getPrices = () =>
    axios.get(API);

export const updatePrice = (id, data) =>
    axios.put(`${API}/${id}`, data);