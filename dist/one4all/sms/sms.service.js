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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const https = require("https");
const constants_1 = require("../../constants");
const generator_util_1 = require("../../utilities/generator.util");
let SmsService = SmsService_1 = class SmsService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(SmsService_1.name);
        this.smsBaseUrl = constants_1.ONE4ALL_BASEURL;
    }
    SendSMS(transDto) {
        const { recipient, message, senderId } = transDto;
        const s2Params = {
            recipient: recipient || "",
            message: message || "",
            sender_id: senderId || "",
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || ""
        };
        const s2Url = `recipient=${s2Params.recipient}&message=${s2Params.message}&sender_id=${s2Params.sender_id}&trxn=${s2Params.trxn}`;
        const configs = {
            url: this.smsBaseUrl + `/TopUpApi/sms?` + s2Url,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        };
        this.logger.log(`Post BulkSMS payload ==> ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((pbsRes) => {
            this.logger.verbose(`BulkSMS response ++++ ${JSON.stringify(pbsRes.data)}`);
            return pbsRes.data;
        }), (0, operators_1.catchError)((taError) => {
            this.logger.error(`BulkSMS ERROR response ---- ${JSON.stringify(taError.response.data)}`);
            const taErrorMessage = taError.response.data;
            throw new common_1.NotFoundException(taErrorMessage);
        }));
    }
    postBulkSMS(transDto) {
        const { recipient, message, senderId } = transDto;
        const pbsParams = {
            recipient: recipient || "",
            message: message || "",
            sender_id: senderId || "",
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || ""
        };
        const configs = {
            url: this.smsBaseUrl + `/TopUpApi/sms`,
            body: pbsParams,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        };
        this.logger.log(`Post BulkSMS payload == ${JSON.stringify(configs)}`);
        return this.httpService.post(configs.url, configs.body, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((pbsRes) => {
            this.logger.verbose(`BulkSMS response ++++ ${JSON.stringify(pbsRes.data)}`);
            return pbsRes.data;
        }), (0, operators_1.catchError)((taError) => {
            this.logger.error(`BulkSMS ERROR response ---- ${JSON.stringify(taError.response.data)}`);
            const taErrorMessage = taError.response.data;
            throw new common_1.NotFoundException(taErrorMessage);
        }));
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], SmsService);
//# sourceMappingURL=sms.service.js.map