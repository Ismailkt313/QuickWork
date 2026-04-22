import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
console.log("API URL:", apiUrl);
export const apiClient = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
