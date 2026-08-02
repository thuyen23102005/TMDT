import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/report`;

export const getDashboardReport = (from, to) =>
    axios.get(`${API}?from=${from}&to=${to}`);

export const getRevenueChart = (from, to) =>
    axios.get(`${API}/chart?from=${from}&to=${to}`);

export const getTopProducts=(from,to)=>

axios.get(

`${API}/top-products?from=${from}&to=${to}`

);