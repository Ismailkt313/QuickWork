import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

export const generateJobCode = (): string => {
    return `QW-JOB-${nanoid()}`;
};

export const generateAssignmentCode = (): string => {
    return `QW-ASG-${nanoid()}`;
};

export const generateTransactionCode = (): string => {
    return `QW-TXN-${nanoid()}`;
};
