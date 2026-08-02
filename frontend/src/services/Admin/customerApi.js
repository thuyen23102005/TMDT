import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/customers`;

export const getCustomers = () => axios.get(API);

export const updateCustomerStatus = (id, data) =>
    axios.put(`${API}/${id}/status`, data);