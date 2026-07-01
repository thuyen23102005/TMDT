import axios from "axios";

const API = "http://localhost:5000/api/products";

export const getProducts = () => axios.get(API);