import { ILocation, IPortfolioItem } from '../interfaces/serviceProvider.interface';
import { AppError } from '../../../utils/AppError';

export class UpdateProviderDTO {
    public readonly headline?: string;
    public readonly about?: string;
    public readonly profileImage?: string;
    public readonly skills?: string[];
    public readonly yearsOfExperience?: number;
    public readonly hourlyRate?: number;
    public readonly location?: ILocation;
    public readonly portfolio?: IPortfolioItem[];
    public readonly isActive?: boolean;

    private constructor(data: any) {
        if (data.headline) this.headline = data.headline;
        if (data.about) this.about = data.about;
        if (data.profileImage) this.profileImage = data.profileImage;
        if (data.skills) this.skills = data.skills;
        if (data.yearsOfExperience !== undefined) this.yearsOfExperience = Number(data.yearsOfExperience);
        if (data.hourlyRate !== undefined) this.hourlyRate = Number(data.hourlyRate);
        if (data.location) this.location = data.location;
        if (data.portfolio) this.portfolio = data.portfolio;
        if (data.isActive !== undefined) this.isActive = data.isActive === true || data.isActive === 'true';
    }

    public static create(data: any): UpdateProviderDTO {
        const errors: string[] = [];

        if (data.headline !== undefined && data.headline.trim().length === 0) {
            errors.push("Headline cannot be empty");
        }

        if (data.about !== undefined && data.about.trim().length < 80) {
            errors.push("About section must be at least 80 characters long");
        }

        if (data.profileImage !== undefined && data.profileImage.trim().length === 0) {
            errors.push("Profile image cannot be empty");
        }

        if (data.skills !== undefined && (!Array.isArray(data.skills) || data.skills.length === 0)) {
            errors.push("At least one skill is required if updating skills");
        }

        if (data.yearsOfExperience !== undefined && (isNaN(Number(data.yearsOfExperience)) || Number(data.yearsOfExperience) < 0)) {
            errors.push("Valid years of experience is required");
        }

        if (data.hourlyRate !== undefined && (isNaN(Number(data.hourlyRate)) || Number(data.hourlyRate) <= 0)) {
            errors.push("Valid hourly rate greater than 0 is required");
        }

        if (data.location !== undefined && (!data.location.id || !data.location.name)) {
            errors.push("Complete location data is required");
        }

        if (data.portfolio !== undefined) {
            if (!Array.isArray(data.portfolio) || data.portfolio.length === 0) {
                errors.push("At least one portfolio item is required if updating portfolio");
            } else {
                data.portfolio.forEach((item: any, index: number) => {
                    if (!item.title || item.title.trim().length === 0) {
                        errors.push(`Portfolio item ${index + 1} requires a title`);
                    }
                    if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
                        errors.push(`Portfolio item ${index + 1} requires at least one image`);
                    }
                });
            }
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), 400);
        }

        return new UpdateProviderDTO(data);
    }
}
