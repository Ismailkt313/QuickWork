import { Document } from "mongoose";

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
