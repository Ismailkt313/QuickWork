import { IUser } from "../../auth/interfaces/auth.interface";

export interface IUserListQuery {
    page: number;
    limit: number;
    search?: string;
}

export interface IUserListItem {
    id: string;
    name: string;
    email: string;
    role: string;
    isBlocked: boolean;
    createdAt: Date;
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

export interface IAdminRepository {
    getUsers(query: IUserListQuery): Promise<IUser[]>;
    getUserCount(search?: string): Promise<number>;
    toggleBlockUser(userId: string): Promise<IUser>;
}

export interface IAdminService {
    getUsers(query: IUserListQuery): Promise<IUserListResponse>;
    toggleBlockUser(userId: string): Promise<{ success: boolean; message: string; data: { isBlocked: boolean } }>;
}
