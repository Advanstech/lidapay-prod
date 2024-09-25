"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const bcrypt = require("bcrypt");
class PasswordUtil {
    static async hashPassword(password) {
        try {
            const saltRounds = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, saltRounds);
        }
        catch (error) {
            throw new Error(`Error hashing password: ${error.message}`);
        }
    }
    static async comparePassword(password, hash) {
        console.debug('ComparePassword', password);
        try {
            return await bcrypt.compare(password, hash);
        }
        catch (error) {
            throw new Error(`Error comparing password: ${error.message}`);
        }
    }
}
exports.PasswordUtil = PasswordUtil;
//# sourceMappingURL=password.util.js.map