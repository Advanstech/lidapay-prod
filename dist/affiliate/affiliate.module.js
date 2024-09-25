"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffiliateModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const affiliate_controller_1 = require("./affiliate.controller");
const affiliate_service_1 = require("./affiliate.service");
const affiliate_entity_1 = require("./entities/affiliate.entity");
const referral_entity_1 = require("./entities/referral.entity");
let AffiliateModule = class AffiliateModule {
};
exports.AffiliateModule = AffiliateModule;
exports.AffiliateModule = AffiliateModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: affiliate_entity_1.Affiliate.name, schema: affiliate_entity_1.AffiliateSchema },
                { name: referral_entity_1.Referral.name, schema: referral_entity_1.ReferralSchema },
            ]),
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [affiliate_controller_1.AffiliateController],
        providers: [affiliate_service_1.AffiliateService],
        exports: [affiliate_service_1.AffiliateService],
    })
], AffiliateModule);
//# sourceMappingURL=affiliate.module.js.map