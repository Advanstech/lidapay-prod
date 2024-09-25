"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("../constants");
const secretKey = process.env.JWT_SECRET || constants_1.JWT_SECRET;
class TokenUtil {
    static generateToken(payload, expiresIn = '1h') {
        console.debug(`TokenUtil, generateToken() payload ==> ${JSON.stringify(payload)}`);
        try {
            const token = (0, jsonwebtoken_1.sign)(payload, secretKey, { expiresIn });
            if (!token) {
                throw new Error('Failed to generate token');
            }
            return token;
        }
        catch (error) {
            console.error(`Error generating token: ${error.message}`);
            throw new Error('Token generation failed');
        }
    }
    static verifyToken(token) {
        console.debug(`TokenUtil, VerifyToken input: ${JSON.stringify(token)}`);
        try {
            return (0, jsonwebtoken_1.verify)(token, constants_1.JWT_SECRET);
        }
        catch (error) {
            console.error(`Error verifying token: ${error.message}`);
            throw new Error(`Invalid token: ${error.message}`);
        }
    }
    static generateVerificationCode() {
        const code = Math.floor(100000 + Math.random() * 900000);
        return code.toString().substring(0, 6);
    }
}
exports.TokenUtil = TokenUtil;
//# sourceMappingURL=token.util.js.map