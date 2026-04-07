import { JOB_DURATION_TYPE } from "../../../../constants/jobDuration";

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

    durationType: JOB_DURATION_TYPE;
    startDate: string;
    days: string;
    minBudget: string;
    maxBudget: string;
    freelancersNeeded: string;
    location: string;
    address: string;
}
