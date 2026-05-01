import { Document } from "mongoose";
import { Request, Response, NextFunction } from 'express'

export interface ISkill extends Document {
    name: string;
    slug: string;
    createdAt: Date;
}

export interface ISkillRepository {
    findById(id: string): Promise<ISkill | null>;
    findByName(name: string): Promise<ISkill | null>
    findBySlug(slug: string): Promise<ISkill | null>;
    create(skillData: Partial<ISkill>, session?: any): Promise<ISkill>;
    skills(filter: any): Promise<ISkill[] | null>;
    getServices():Promise<ISkill[]>;
    getAllSkills(search?: string, locationId?: string): Promise<ISkill[]>;
    getSkills(): Promise<ISkill[]>;
    getMySkill(userId:string):Promise<ISkill[]>
}

export interface ISkillService {
    searchSkills(query:string): Promise<{ success: boolean; data?: ISkill[] }>;
    getAllSkills(search?: string, locationId?: string): Promise<{ success: boolean; data: ISkill[] }>;
    getSkills(): Promise<{ success: boolean; data: ISkill[] }>;
    getMySkills(userId:any):Promise<{success:boolean, data:ISkill[]}>
}
export interface ISkillController {
    searchSkills(req: any, res: any, next: any): Promise<void>;
    getAllSkills(req: any, res: any, next: any): Promise<void>;
    getSkills(req: any, res: any, next: any): Promise<void>;
    myskills(req: Request, res: Response, next: NextFunction): Promise<void>;
}

