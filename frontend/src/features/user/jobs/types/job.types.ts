export interface ServiceCategory {
    _id: string;
    id: string;
    name: string;
}

export interface Location {
    id: string;
    name: string;
}

export interface JobFormData {
    title: string;
    description: string;
    category: string;
    experience: string;
    durationType: string;
    startDate: string;
    days: string;
    minBudget: string;
    maxBudget: string;
    freelancersNeeded: string;
    location: string;
    address: string;
}
