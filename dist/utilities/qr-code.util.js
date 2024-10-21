"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrCode = generateQrCode;
const QRCode = require("qrcode");
const constants_1 = require("../constants");
const url_1 = require("url");
async function generateQrCode(userId) {
    console.log('Generating QR code for user', userId);
    if (!userId) {
        throw new Error('userId is required');
    }
    try {
        const url = new url_1.URL(constants_1.DOMAIN_URL + `/register?ref=${userId}`);
        return await QRCode.toDataURL(url.toString());
    }
    catch (err) {
        console.error('Error generating QR code:', err);
        throw new Error('Error generating QR code:');
    }
}
//# sourceMappingURL=qr-code.util.js.map