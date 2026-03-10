import { Adminapi } from "../../services/adminApi";

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
    const response = await Adminapi.post<AdminLoginResponse>(
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
    const response = await Adminapi.get<IUserListResponse>("/admin/users", {
        params,
        headers: getAdminHeaders(),
    });
    return response.data;
};

export const toggleBlockUser = async (
    userId: string
): Promise<{ success: boolean; message: string; data: { isBlocked: boolean } }> => {
    const response = await Adminapi.patch(
        `/admin/users/${userId}/block`,
        {},
        { headers: getAdminHeaders() }
    );
    return response.data;
};

export const getPendingProviders = async (): Promise<IUserListResponse> => {
    const response = await Adminapi.get<IUserListResponse>("/admin/providers/pending", {
        headers: getAdminHeaders(),
    });
    return response.data;
};

export const approveProvider = async (
    providerId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await Adminapi.patch(
        `/admin/providers/${providerId}/approve`,
        {},
        { headers: getAdminHeaders() }
    );
    return response.data;
};

export const rejectProvider = async (
    providerId: string,
    reason: string
): Promise<{ success: boolean; message: string }> => {
    const response = await Adminapi.patch(
        `/admin/providers/${providerId}/reject`,
        { reason },
        { headers: getAdminHeaders() }
    );
    return response.data;
};
