"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const constants_1 = require("../constants");
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: constants_1.GMAIL_MAIL_SERVICE,
            port: constants_1.GMAIL_MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_ADDRESS || constants_1.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD || constants_1.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    async sendMail(to, subject, text, html) {
        const mailOptions = {
            from: 'info@advansistechnologies.com',
            to,
            subject,
            text,
            html,
        };
        try {
            const result = await this.transporter.sendMail(mailOptions);
            return result;
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Error sending email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map