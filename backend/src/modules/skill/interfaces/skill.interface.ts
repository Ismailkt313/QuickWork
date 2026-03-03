import { Document } from "mongoose";

export interface ISkill extends Document {
    name: string;
    slug: string;
    createdAt: Date;
}
