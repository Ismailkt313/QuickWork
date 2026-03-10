import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL
console.log(apiUrl, 'API URL is here')



export const Adminapi = axios.create({
    baseURL: `${apiUrl}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});
Adminapi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
