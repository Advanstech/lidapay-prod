import { Schema, Document, Types } from 'mongoose';
// Import the User model if necessary
// import User from './user.model'; // Adjust the path as needed

// Define the Account interface
export interface IAccount extends Document {
    userId: Types.ObjectId; // Reference to the user
    accountId: string; // Unique account identifier
    balance: number; // Current balance of the account
    transactions: Array<{
        amount: number; // Amount of the transaction
        type: 'credit' | 'debit' | 'momo' | 'transfer'; // Type of transaction
        date: Date; // Date of the transaction
        description?: string; // Optional description
    }>;
}
// Create the Account schema
const AccountSchema = new Schema<IAccount>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User model
    accountId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 }, // Current balance of the account
    transactions: [{
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'debit', 'momo', 'transfer'], required: true }, // Updated enum to include 'momo' and 'transfer'
        date: { type: Date, default: Date.now },
        description: { type: String }
    }]
});

// Export the model and the document type
export type AccountDocument = IAccount; // Define AccountDocument type
export default AccountSchema;
