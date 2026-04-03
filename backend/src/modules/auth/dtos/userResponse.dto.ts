import { IUser } from "../interfaces/auth.interface";

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    number?: string;
    role: "user" | "admin" | "provider";
    isBlocked: boolean;
    createdAt: Date;
}

export const mapUserToResponseDTO = (user: IUser): UserResponseDTO => {
    return {
        id: user._id ? user._id.toString() : (user as any).id,
        name: user.name,
        email: user.email,
        number: user.number,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
    };
};
