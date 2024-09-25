"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GravatarService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const axios_1 = require("axios");
let GravatarService = class GravatarService {
    constructor() {
        this.GRAVATAR_BASE_URL = 'https://www.gravatar.com/avatar/';
        this.DEFAULT_SIZE = 200;
    }
    generateAvatarUrl(email, size = this.DEFAULT_SIZE) {
        if (!email || typeof email !== 'string') {
            throw new Error('Invalid email address');
        }
        if (size <= 0) {
            throw new Error('Invalid size');
        }
        const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
        return `${this.GRAVATAR_BASE_URL}${hash}?s=${size}`;
    }
    async fetchAvatar(email, size = this.DEFAULT_SIZE) {
        try {
            const avatarUrl = this.generateAvatarUrl(email, size);
            const response = await axios_1.default.get(avatarUrl, { responseType: 'arraybuffer' });
            if (response.status === 200) {
                const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                return `data:image/png;base64,${base64Image}`;
            }
            else {
                throw new Error(`Failed to fetch Gravatar: ${response.status}`);
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error fetching Gravatar:', error.message);
            }
            else {
                console.error('Unexpected error:', error);
            }
            return null;
        }
    }
};
exports.GravatarService = GravatarService;
exports.GravatarService = GravatarService = __decorate([
    (0, common_1.Injectable)()
], GravatarService);
//# sourceMappingURL=gravatar.util.js.map