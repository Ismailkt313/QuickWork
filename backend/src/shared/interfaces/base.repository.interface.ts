import { Document } from 'mongoose';

export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    updateById(id: string, data: Partial<T>): Promise<T | null>;
    deleteById(id: string): Promise<boolean>;
}
