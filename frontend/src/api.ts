import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Configure Axios Interceptor to automatically attach JWT token
api.interceptors.request.use(
    (config) => {
        // Check localStorage for the token (adjust key based on your auth implementation)
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);