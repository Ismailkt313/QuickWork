import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL
console.log(apiUrl, 'API URL is here')



export const api = axios.create({
    baseURL: `${apiUrl}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
