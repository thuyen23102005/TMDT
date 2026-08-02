import axios from "axios";

const API =`${import.meta.env.VITE_API_URL}/api/products`;

export const getAllProducts = () =>
    axios.get(`${API}/all`);

export const getProductById = (id) =>
    axios.get(`${API}/${id}`);