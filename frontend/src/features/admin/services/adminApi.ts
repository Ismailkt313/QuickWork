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

 
export interface IUserListItem {
  id: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export const adminLogin = (data: { email: string; password: string }) => {
  return Adminapi.post('/auth/admin/login', data);
};

export const getPendingProviders = () => {
  return Adminapi.get('/admin/providers/pending');
};

export const approveProvider = (id: string) => {
  return Adminapi.patch(`/admin/provider/${id}/approve`);
};

export const rejectProvider = (id: string, reason?: string) => {
  return Adminapi.patch(`/admin/provider/${id}/reject`, { reason });
};

export const getUsers = (params?: { page?: number; limit?: number; search?: string }) => {
  const tocken = localStorage.getItem("adminAccessToken");
  
  console.log("Admin Access Token:", tocken);
  return Adminapi.get('/admin/users', { params });
};

export const toggleBlockUser = (userId: string) => {
  return Adminapi.patch(`/admin/users/${userId}/block`);
};
