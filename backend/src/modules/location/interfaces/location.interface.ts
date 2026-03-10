import { Document } from "mongoose";
import { CreateLocationDTO } from "../dtos/createLocation.dto";

export interface ILocation extends Document {
    name: string;
    slug: string;
    lat: number;
    lon: number;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    createdAt: Date;
}

export interface ILoactionresponse {
    id: string;
    name: string;
    lat: number;
    lon: number;
}   

export interface ILocationService {
    upsertLocation(dto: CreateLocationDTO): Promise<{ success: boolean; data: { id: string } }>;
    searchLocations(query: string): Promise<{ success: boolean; data: any[] }>;
    getAllLocations(): Promise<{ success: boolean; data: ILoactionresponse[] }>;
}

export interface ILocationRepository {
    findBySlug(slug: string): Promise<ILocation | null>;
    create(locationData: Partial<ILocation>): Promise<ILocation>;
    searchByName(name: string): Promise<ILocation[]>;
    getAllLocations(): Promise<ILocation[]>;
    getfullLocations(): Promise<ILoactionresponse[] | null>;
}

export interface ILocationController {
    saveLocation(req: any, res: any, next: any): Promise<void>;
    searchLocations(req: any, res: any, next: any): Promise<void>;
    getAllLocations(req: any, res: any, next: any): Promise<void>;
}