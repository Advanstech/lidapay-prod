"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AccountSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    accountId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [{
            amount: { type: Number, required: true },
            type: { type: String, enum: ['credit', 'debit', 'momo', 'transfer'], required: true },
            date: { type: Date, default: Date.now },
            description: { type: String }
        }]
});
exports.default = AccountSchema;
//# sourceMappingURL=account.schema.js.map