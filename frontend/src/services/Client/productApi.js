import axios from "axios";

const API = "http://localhost:5000/api/products";

export const getAllProducts = () =>
    axios.get(`${API}/all`);

export const getProductById = (id) =>
    axios.get(`${API}/${id}`);