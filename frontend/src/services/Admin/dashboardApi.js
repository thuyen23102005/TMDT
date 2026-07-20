import axios from "axios";

const API = "http://localhost:5000/api/dashboard";

export const getDashboard = (from, to) =>
    axios.get(API, {
        params: {
            from,
            to
        }
    });