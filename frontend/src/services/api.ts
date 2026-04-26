import axios from "axios";
const apiUrl = (import.meta as any).env.VITE_API_URL;

export const api = axios.create({
  baseURL: `${apiUrl}/api/v1`,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      const errorType =
        error.response.status === 403 ? "blocked" : "session_expired";

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = `/auth/login?error=${errorType}`;
    }
    return Promise.reject(error);
  },
);
