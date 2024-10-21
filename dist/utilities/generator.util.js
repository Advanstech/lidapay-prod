"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorUtil = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const uuid_1 = require("uuid");
class GeneratorUtil {
    static generateTransactionId(prefix = 'TXN') {
        const timestamp = Date.now().toString(36);
        const randomString = (0, uuid_1.v4)().split('-')[0];
        return `${prefix}-${timestamp}-${randomString}`.toUpperCase();
    }
    static generateMerchantKey() {
        const merchantId = process.env.PAYSWITCH_USERNAME || constants_1.PAYSWITCH_USERNAME;
        const merchantToken = process.env.PAYSWITCH_APIKEY || constants_1.PAYSWITCH_APIKEY;
        const encodedAuth = '' + Buffer.from(merchantId + ':' + merchantToken).toString('base64');
        console.log('encoded string toBase64 Auth ===>');
        console.debug(encodedAuth);
        return encodedAuth;
    }
    static generateTransactionIdPayswitch(prefix = 'PSW') {
        const timestamp = Date.now().toString(36);
        const randomString = (0, uuid_1.v4)().split('-')[0];
        return `${prefix}-${timestamp}-${randomString}`.toUpperCase();
    }
    static psRandomGeneratedNumber() {
        const logger = new common_1.Logger();
        let text = '';
        const possible = '0123456789';
        const date = new Date();
        const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
        const month = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
        const year = date.getFullYear().toString().substr(2, 2);
        const customDate = '' + month + day + year;
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        const transId = text + customDate;
        logger.log('generated random transaction +++ ' + transId);
        return transId;
    }
    static async generateAccountNumber() {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear().toString().slice(-2)}`;
        const shortUniqueId = (0, uuid_1.v4)().split('-')[0];
        return `${formattedDate}-${shortUniqueId}`;
    }
}
exports.GeneratorUtil = GeneratorUtil;
//# sourceMappingURL=generator.util.js.map