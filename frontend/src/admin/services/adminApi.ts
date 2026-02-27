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
