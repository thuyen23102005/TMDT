import axios from "axios";

const API = "http://localhost:5000/api/orders";

export const getOrders = () => axios.get(API);

export const getOrderDetail = (id) => axios.get(`${API}/${id}`);

export const updateOrderStatus = (id,data)=>

    axios.put(

        `${API}/${id}/status`,

        data

    );