import { IUser } from "../interfaces/auth.interface";
import { ROLES } from "../../../constants/roles";

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    number?: string;
    role: ROLES;
    isBlocked: boolean;
    profileImage?: {
        url: string;
        public_id: string;
    };
    authProvider: 'local' | 'google' | 'hybrid';
    hasPassword: boolean;
    createdAt: Date;
}

export const mapUserToResponseDTO = (user: IUser): UserResponseDTO => {
    return {
        id: user._id ? user._id.toString() : (user as unknown as { id?: string }).id || '',
        name: user.name,
        email: user.email,
        number: user.number,
        role: user.role,
        isBlocked: user.isBlocked,
        profileImage: user.profileImage,
        authProvider: user.authProvider || 'local',
        hasPassword: user.hasPassword !== undefined ? user.hasPassword : !!user.hashedPassword,
        createdAt: user.createdAt,
    };
};
