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
exports.RootAssetLinksController = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
let RootAssetLinksController = class RootAssetLinksController {
    getAssetLinks() {
        return [
            {
                relation: ['delegate_permission/common.handle_all_urls'],
                target: {
                    namespace: 'android_app',
                    package_name: 'com.advansistechnologies.lidapay',
                    sha256_cert_fingerprints: [constants_1.DIGITAL_ASSET_LINKS_FINGERPRINT],
                },
            },
        ];
    }
};
exports.RootAssetLinksController = RootAssetLinksController;
__decorate([
    (0, common_1.Get)('assetlinks.json'),
    (0, common_1.Header)('Content-Type', 'application/json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RootAssetLinksController.prototype, "getAssetLinks", null);
exports.RootAssetLinksController = RootAssetLinksController = __decorate([
    (0, common_1.Controller)('.well-known')
], RootAssetLinksController);
//# sourceMappingURL=root-asset-links.controller.js.map