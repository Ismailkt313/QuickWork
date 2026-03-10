export interface ServiceCategory {
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
    duration: string;
    budget: string;
    freelancersNeeded: string;
    location: string;
    address: string;
}
