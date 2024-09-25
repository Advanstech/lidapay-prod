"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtil = void 0;
class ValidationUtil {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidPhoneNumber(phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    }
    static getOperatorName(networkCode) {
        const operators = {
            0: 'Unknown (auto detect network)',
            1: 'AirtelTigo',
            2: 'EXPRESSO',
            3: 'GLO',
            4: 'MTN',
            5: 'TiGO',
            6: 'Telecel',
            8: 'Busy',
            9: 'Surfline'
        };
        return operators[networkCode] || 'Unknown';
    }
}
exports.ValidationUtil = ValidationUtil;
//# sourceMappingURL=validation.util.js.map