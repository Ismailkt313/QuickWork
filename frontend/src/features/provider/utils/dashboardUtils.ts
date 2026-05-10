/**
 * Dashboard Utility Helpers for safe data rendering
 * Prevents NaN, undefined, and null from reaching the UI
 */

/**
 * Safely converts any value to a number.
 * Returns fallback for null, undefined, NaN, Infinity, or non-numeric strings.
 */
export const safeNumber = (value: any, fallback = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
};

/**
 * Safely formats a number as INR currency.
 * Handles null/undefined/NaN gracefully, always returns a formatted string.
 */
export const safeCurrency = (value: any, locale = 'en-IN'): string => {
  const num = safeNumber(value);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${num.toLocaleString()}`;
  }
};

/**
 * Safely formats a value as a percentage string.
 * Clamps between 0-100 by default for progress bars.
 */
export const safePercentage = (value: any, precision = 0, clamp = false): string => {
  let num = safeNumber(value);
  if (clamp) {
    num = Math.max(0, Math.min(100, num));
  }
  return `${num.toFixed(precision)}%`;
};

/**
 * Clamps a number value between min and max for safe progress bar rendering.
 */
export const clampedNumber = (value: any, min = 0, max = 100): number => {
  return Math.max(min, Math.min(max, safeNumber(value)));
};

/**
 * Safely formats a decimal (e.g. rating) to fixed precision.
 * Returns "0.0" instead of "NaN" on bad input.
 */
export const safeDecimal = (value: any, precision = 1): string => {
  return safeNumber(value).toFixed(precision);
};

/**
 * Safely formats a date string for display.
 * Returns a graceful fallback for invalid/missing dates.
 */
export const formatDate = (date: any): string => {
  if (!date) return 'No date';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Returns a safe string, preventing "undefined" or "null" from rendering.
 */
export const safeString = (value: any, fallback = '—'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};
