import { customAlphabet } from 'nanoid';

// Custom alphabet: uppercase letters and numbers, excluding ambiguous ones like I, l, 1, 0, O
const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

/**
 * Generates a human-readable Job code.
 * Pattern: QW-JOB-XXXXXX
 */
export const generateJobCode = (): string => {
    return `QW-JOB-${nanoid()}`;
};

/**
 * Generates a human-readable Assignment code.
 * Pattern: QW-ASG-XXXXXX
 */
export const generateAssignmentCode = (): string => {
    return `QW-ASG-${nanoid()}`;
};

/**
 * Generates a human-readable Transaction code.
 * Pattern: QW-TXN-XXXXXX
 */
export const generateTransactionCode = (): string => {
    return `QW-TXN-${nanoid()}`;
};
