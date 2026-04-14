import { JOB_DURATION_TYPE } from "../../../../constants/jobDuration";

export interface ServiceCategory {
    _id: string;
    id: string;
    name: string;
}

export interface Location {
    id: string;
    name: string;
    center?: {
        type: "Point";
        coordinates: [number, number];
    };
}

export interface JobFormData {
    title: string;
    description: string;
    contactNumber: string;
    category: string;

    durationType: JOB_DURATION_TYPE;
    startDate: string;
    days: string;
    minBudget: string;
    maxBudget: string;
    freelancersNeeded: string;
    districtId: string;
    selectedLocation: {
        address: string;
        lat: number;
        lng: number;
        district: string;
    } | null;
    additionalDetails: string;
    isUrgent: boolean;
}
