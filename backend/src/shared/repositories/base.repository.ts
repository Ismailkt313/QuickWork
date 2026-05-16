import { Model, Document } from 'mongoose';
import { IBaseRepository } from '../interfaces/base.repository.interface';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        const entity = new this.model(data);
        return await entity.save();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }

    async updateById(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data as any, { new: true }).exec();
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }
}
