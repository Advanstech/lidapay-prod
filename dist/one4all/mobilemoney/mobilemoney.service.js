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
exports.MobilemoneyService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const https = require("https");
const constants_1 = require("../../constants");
const generator_util_1 = require("../../utilities/generator.util");
let MobilemoneyService = class MobilemoneyService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger('MobilemoneyService');
        this.momoBaseUrl = constants_1.ONE4ALL_BASEURL;
    }
    sendMobileMoney(transDto) {
        const { recipientMsisdn, amount } = transDto;
        const rm2Params = {
            recipient: recipientMsisdn || '',
            amount: amount || '',
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || '',
        };
        const sm2Url = `/TopUpApi/b2c?recipient=${rm2Params.recipient}&amount=${rm2Params.amount}&trxn=${rm2Params.trxn}`;
        const configs = {
            url: this.momoBaseUrl + sm2Url,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`SEND MONEY payload config == ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((Sm2Res) => {
            this.logger.verbose(`SEND MONEY server response => ${JSON.stringify(Sm2Res.data)}`);
            return Sm2Res.data;
        }), (0, operators_1.catchError)((Sm2Error) => {
            this.logger.error(`ERROR CREDIT WALLET => ${JSON.stringify(Sm2Error.response.data)}`);
            const Sm2ErrorMessage = Sm2Error.response.data;
            throw new common_1.NotFoundException(Sm2ErrorMessage);
        }));
    }
    receiveMobileMoney(transDto) {
        const { customerMsisdn, amount } = transDto;
        const rm2Params = {
            recipient: customerMsisdn || '',
            amount: amount || '',
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || '',
        };
        const rm2Url = `/TopUpApi/c2b?recipient=${rm2Params.recipient}&amount=${rm2Params.amount}&trxn=${rm2Params.trxn}`;
        const configs = {
            url: this.momoBaseUrl + rm2Url,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`RECEIVE MONEY payload config == ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((rm2Res) => {
            this.logger.verbose(`RECEIVE MONEY server response => ${JSON.stringify(rm2Res.data)}`);
            return rm2Res.data;
        }), (0, operators_1.catchError)((rm2Error) => {
            this.logger.error(`ERROR DEBIT WALLET => ${JSON.stringify(rm2Error.response.data)}`);
            const rm2ErrorMessage = rm2Error.response.data;
            throw new common_1.NotFoundException(rm2ErrorMessage);
        }));
    }
};
exports.MobilemoneyService = MobilemoneyService;
exports.MobilemoneyService = MobilemoneyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], MobilemoneyService);
//# sourceMappingURL=mobilemoney.service.js.map