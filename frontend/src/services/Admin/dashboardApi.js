import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/dashboard`;

export const getDashboard = (from, to) =>
    axios.get(API, {
        params: {
            from,
            to
        }
    });