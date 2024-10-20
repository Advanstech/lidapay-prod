import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a short account number based on the current date and a unique identifier.
 * Format: ddmmyy-xxxxxx (where xxxxxx is a short unique identifier)
 * @returns {string} The generated account number.
 */
export function generateAccountNumber(): string {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear().toString().slice(-2)}`; // Format as ddmmyy
    const shortUniqueId = uuidv4().split('-')[0]; // Take the first part of the UUID for uniqueness
    return `${formattedDate}-${shortUniqueId}`; // Concatenate date with short unique ID
}