import { Types } from 'mongoose';

export function getObjectId(value: any): string {
    if (!value) {
        throw new Error('getObjectId: value is null or undefined');
    }

    if (value instanceof Types.ObjectId) {
        return value.toString();
    }

    if (typeof value === 'object' && value._id) {
        return value._id.toString();
    }

    if (typeof value === 'string') {
        return value;
    }

    throw new Error(`getObjectId: cannot extract ObjectId from value of type ${typeof value}`);
}
