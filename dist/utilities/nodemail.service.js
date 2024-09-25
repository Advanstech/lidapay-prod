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
var NodemailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let NodemailService = NodemailService_1 = class NodemailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NodemailService_1.name);
    }
    async sendMail(to, subject, text, html) {
        const transporter = nodemailer.createTransport({
            host: this.configService.get('GMAIL_MAIL_SERVICE'),
            port: this.configService.get('GMAIL_MAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('EMAIL_ADDRESS'),
                pass: this.configService.get('EMAIL_PASSWORD'),
            },
        });
        try {
            await transporter.verify();
            this.logger.log('SMTP connection established successfully');
            const mailOptions = {
                from: this.configService.get('EMAIL_ADDRESS'),
                to,
                subject,
                text,
                html: html || undefined,
            };
            const info = await transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId}`);
        }
        catch (error) {
            this.logger.error(`Error sending email: ${error.message}`);
            this.logger.error(`SMTP Config: ${JSON.stringify({
                host: this.configService.get('GMAIL_MAIL_SERVICE'),
                port: this.configService.get('GMAIL_MAIL_PORT'),
                user: this.configService.get('EMAIL_ADDRESS'),
            })}`);
            throw new Error(`Error sending email: ${error.message}`);
        }
    }
};
exports.NodemailService = NodemailService;
exports.NodemailService = NodemailService = NodemailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NodemailService);
//# sourceMappingURL=nodemail.service.js.map