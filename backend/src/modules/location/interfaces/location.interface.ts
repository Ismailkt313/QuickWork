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

import { Request, Response, NextFunction } from 'express';

export interface ILocationController {
    getAllLocations(req: Request, res: Response, next: NextFunction): Promise<void>;
}