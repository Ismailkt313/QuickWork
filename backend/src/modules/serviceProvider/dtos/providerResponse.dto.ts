import { ILocation, IPortfolioItem } from "../interfaces/serviceProvider.interface";

export interface ProviderResponseDTO {
    id: string;
    userId: string;
    name: string;
    email: string;
    headline: string;
    about: string;
    profileImage: string;
    skills: { id: string, name: string }[];
    yearsOfExperience: number;
    hourlyRate: number;
    location: ILocation;
    portfolio: IPortfolioItem[];
    isActive: boolean;
    verificationStatus: string;
    rejectionReason?: string;
    availability: any[];
    blockedDates: any[];
}

export const mapProviderToResponseDTO = (provider: any): ProviderResponseDTO => {
    const user = provider.userId || {};

    return {
        id: provider._id ? provider._id.toString() : provider.id,
        userId: user._id ? user._id.toString() : user.id,
        name: user.name || 'Anonymous',
        email: user.email || '',
        headline: provider.headline,
        about: provider.about,
        profileImage: provider.profileImage,
        skills: Array.isArray(provider.skills) ? provider.skills.map((s: any) => ({
            id: s._id ? s._id.toString() : s.toString(),
            name: s.name || 'Unknown Skill'
        })) : [],
        yearsOfExperience: provider.yearsOfExperience,
        hourlyRate: provider.hourlyRate,
        location: provider.location,
        portfolio: provider.portfolio,
        isActive: provider.isActive,
        verificationStatus: provider.verification?.status || 'pending',
        rejectionReason: provider.verification?.rejectionReason || '',
        availability: provider.availability || [],
        blockedDates: provider.blockedDates || []
    };
};
