import { Document } from "mongoose";
import { Request, Response, NextFunction } from 'express'

export interface ISkill extends Document {
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

import { IBaseRepository } from '../../../shared/interfaces/base.repository.interface';

export interface ISkillRepository extends IBaseRepository<ISkill> {
    findByName(name: string): Promise<ISkill | null>
    findBySlug(slug: string): Promise<ISkill | null>;
    skills(filter: Record<string, unknown>): Promise<ISkill[] | null>;
    getServices(): Promise<ISkill[]>;
    getAllSkills(page: number, limit: number, search?: string, locationId?: string): Promise<{ data: ISkill[], total: number }>;
    getAdminSkills(page: number, limit: number, search?: string, status?: string): Promise<{ data: ISkill[], total: number }>;
    getSkills(): Promise<ISkill[]>;
    getMySkill(userId: string): Promise<ISkill[]>
}

export interface ISkillService {
    searchSkills(query: string): Promise<{ success: boolean; data?: ISkill[] }>;
    getAllSkills(page: number, limit: number, search?: string, locationId?: string): Promise<{ success: boolean; data: ISkill[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>;
    getAdminSkills(page: number, limit: number, search?: string, status?: string): Promise<{ success: boolean; data: ISkill[], pagination: { total: number; page: number; limit: number; totalPages: number } }>;
    createSkill(skillData: Partial<ISkill>): Promise<{ success: boolean; message: string; data?: ISkill }>;
    updateSkill(id: string, skillData: Partial<ISkill>): Promise<{ success: boolean; message: string; data?: ISkill }>;
    deleteSkill(id: string): Promise<{ success: boolean; message: string }>;
    toggleSkillStatus(id: string): Promise<{ success: boolean; message: string; data?: ISkill }>;
    getSkills(): Promise<{ success: boolean; data: ISkill[] }>;
    getMySkills(userId: string): Promise<{ success: boolean, data: ISkill[] }>
}

export interface ISkillController {
    searchSkills(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllSkills(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAdminSkills(req: Request, res: Response, next: NextFunction): Promise<void>;
    createSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteSkill(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleSkillStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSkills(req: Request, res: Response, next: NextFunction): Promise<void>;
    myskills(req: Request, res: Response, next: NextFunction): Promise<void>;
}

