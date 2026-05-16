import { ILocation, IPortfolioItem, IAvailability, IBlockedDate, IServiceProvider } from "../interfaces/serviceProvider.interface";

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
    availability: IAvailability[];
    blockedDates: IBlockedDate[];
}

export const mapProviderToResponseDTO = (provider: IServiceProvider | Record<string, unknown>): ProviderResponseDTO => {
    const prov = provider as unknown as Record<string, unknown>;
    const user = (prov.userId as Record<string, unknown>) || {};

    return {
        id: prov._id ? (prov._id as { toString(): string }).toString() : (prov.id as string),
        userId: user._id ? (user._id as { toString(): string }).toString() : (user.id as string),
        name: (user.name as string) || 'Anonymous',
        email: (user.email as string) || '',
        headline: prov.headline as string,
        about: prov.about as string,
        profileImage: prov.profileImage as string,
        skills: Array.isArray(prov.skills) ? prov.skills.map((s: unknown) => {
            const skillObj = s as Record<string, unknown>;
            return {
                id: skillObj._id ? (skillObj._id as { toString(): string }).toString() : (s as { toString(): string }).toString(),
                name: (skillObj.name as string) || 'Unknown Skill'
            };
        }) : [],
        yearsOfExperience: prov.yearsOfExperience as number,
        hourlyRate: prov.hourlyRate as number,
        location: prov.location as ILocation,
        portfolio: prov.portfolio as IPortfolioItem[],
        isActive: prov.isActive as boolean,
        verificationStatus: ((prov.verification as Record<string, unknown>)?.status as string) || 'pending',
        rejectionReason: ((prov.verification as Record<string, unknown>)?.rejectionReason as string) || '',
        availability: (prov.availability as IAvailability[]) || [],
        blockedDates: (prov.blockedDates as IBlockedDate[]) || []
    };
};
