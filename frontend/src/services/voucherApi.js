import axios from "axios";

const API = "http://localhost:5000/api/vouchers";

export const getVouchers = () => axios.get(API);

export const createVoucher = (data) => axios.post(API, data);

export const updateVoucher = (id, data) =>
    axios.put(`${API}/${id}`, data);

export const deleteVoucher = (id) =>
    axios.delete(`${API}/${id}`);