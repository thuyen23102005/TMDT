import axios from "axios";

const API = "http://localhost:5000/api/customers";

export const getCustomers = () => axios.get(API);

export const updateCustomerStatus = (id, data) =>
    axios.put(`${API}/${id}/status`, data);