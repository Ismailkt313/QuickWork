import { Types } from 'mongoose';

export function getObjectId(value: unknown): string {
    if (!value) {
        throw new Error('getObjectId: value is null or undefined');
    }

    if (value instanceof Types.ObjectId) {
        return value.toString();
    }

    if (value && typeof value === 'object' && '_id' in value) {
        return String((value as Record<string, unknown>)._id);
    }

    if (typeof value === 'string') {
        return value;
    }

    throw new Error(`getObjectId: cannot extract ObjectId from value of type ${typeof value}`);
}
