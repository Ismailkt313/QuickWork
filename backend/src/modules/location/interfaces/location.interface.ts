import { Document } from "mongoose";

export interface ILocation extends Document {
    name: string;
    center: {
        type: "Point";
        coordinates: [number, number];
    };
}

export interface ILoactionresponse {
    id: string;
    name: string;
    center?: {
        type: "Point";
        coordinates: [number, number];
    };
}

export interface ILocationService {
    getAllLocations(): Promise<{ success: boolean; data: ILoactionresponse[] }>;
}

export interface ILocationRepository {
    getAllLocations(): Promise<ILocation[]>;
    getfullLocations(): Promise<ILoactionresponse[] | null>;
    findById(id: string): Promise<ILocation | null>;
}

export interface ILocationController {
    getAllLocations(req: any, res: any, next: any): Promise<void>;
}