import { api } from "../../api";

export interface AdminLoginPayload {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        admin: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    };
}

export const adminLogin = async (
    payload: AdminLoginPayload
): Promise<AdminLoginResponse> => {
    const response = await api.post<AdminLoginResponse>(
        "/auth/admin/login",
        payload
    );
    return response.data;
};


export interface IUserListItem {
    id: string;
    name: string;
    email: string;
    role: string;
    isBlocked: boolean;
    createdAt: string;
}

export interface IUserListResponse {
    success: boolean;
    message: string;
    data: {
        users: IUserListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface IUserListParams {
    page?: number;
    limit?: number;
    search?: string;
}

const getAdminHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("adminAccessToken")}`,
});

export const getUsers = async (
    params: IUserListParams = {}
): Promise<IUserListResponse> => {
    const response = await api.get<IUserListResponse>("/admin/users", {
        params,
        headers: getAdminHeaders(),
    });
    return response.data;
};

export const toggleBlockUser = async (
    userId: string
): Promise<{ success: boolean; message: string; data: { isBlocked: boolean } }> => {
    const response = await api.patch(
        `/admin/users/${userId}/block`,
        {},
        { headers: getAdminHeaders() }
    );
    return response.data;
};
