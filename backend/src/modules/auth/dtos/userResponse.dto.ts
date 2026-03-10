import { IUser } from "../interfaces/auth.interface";

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

export const mapUserToResponseDTO = (user: IUser): UserResponseDTO => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
};
