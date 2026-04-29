export interface ProviderPortfolioItem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
}

export interface ProviderSkill {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "expert";
}

export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  headline: string;
  bio: string;
  location: {
    address: string;
    districtId: string;
    districtName?: string;
  };
  skills: ProviderSkill[];
  portfolio: ProviderPortfolioItem[];
  verificationStatus: "pending" | "verified" | "rejected";
  rating?: number;
  reviewsCount?: number;
  profileImage?: string;
}
