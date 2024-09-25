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
var PscardpaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PscardpaymentService = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const https = require("https");
const axios_1 = require("@nestjs/axios");
const constants_1 = require("../../constants");
const generator_util_1 = require("../../utilities/generator.util");
let PscardpaymentService = PscardpaymentService_1 = class PscardpaymentService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(PscardpaymentService_1.name);
    }
    psCallback(transDto) {
        const { status, transactionId, description, amount } = transDto;
        const psParam = {
            status,
            transaction_id: transactionId || '',
            reason: description || '',
            amount,
        };
        const configs = {
            url: '',
            body: psParam,
        };
        this.logger.log(`test post payload == ${JSON.stringify(configs)}`);
        return this.httpService.post(configs.url, configs.body).pipe((0, operators_1.map)((wcRes) => {
            this.logger.log(`service response STATUS ==  ${JSON.stringify(wcRes.data)}`);
            return wcRes.data;
        }));
    }
    inlinePayments(transDto) {
        const { description, amount, redirectURL, customerEmail, transId } = transDto;
        const ipParams = {
            merchant_id: constants_1.PAYSWITCH_MERCHANTID,
            transaction_id: generator_util_1.GeneratorUtil.psRandomGeneratedNumber() || transId,
            desc: description,
            amount,
            redirect_url: redirectURL || constants_1.RESPONSE_URL,
            email: customerEmail || '',
        };
        const configs = {
            url: constants_1.PAYSWITCH_CHECKOUT_URL + '/initiate',
            body: ipParams,
            auth: {
                username: `${constants_1.PAYSWITCH_USERNAME_PROD}`,
                password: `${constants_1.PAYSWITCH_APIKEY_PROD}`,
            },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`INLINE PAYMENT payload config == ${JSON.stringify(configs)}`);
        return this.httpService
            .post(configs.url, configs.body, {
            httpsAgent: configs.agent,
            auth: configs.auth,
        })
            .pipe((0, operators_1.map)((ipRes) => {
            this.logger.verbose(`INLINE PAYMENT server response => ${JSON.stringify(ipRes.data)}`);
            return ipRes.data;
        }), (0, operators_1.catchError)((ipError) => {
            this.logger.error(`ERROR INLINE PAYMENT => ${JSON.stringify(ipError.data)}`);
            const ipErrorMessage = ipError.response.data;
            throw new common_1.NotFoundException(ipErrorMessage);
        }));
    }
    cardPayment(transDto) {
        const { merchantId, amount, pan, cardHolderName, customerEmail, currency, expYear, expMonth, cvv, primaryCallbackUrl, } = transDto;
        const cpParams = {
            processing_code: '000000',
            'r-switch': 'VIS',
            transaction_id: generator_util_1.GeneratorUtil.psRandomGeneratedNumber() || '',
            merchant_id: merchantId || '',
            pan: pan || '4310000000000000',
            exp_month: expMonth || '05',
            exp_year: expYear || '21',
            cvv: cvv || '000',
            desc: 'Card Payment Test',
            amount: amount || '000000000100',
            currency: currency || 'GHS',
            card_holder: cardHolderName || 'Card Holder Name',
            customer_email: customerEmail || 'Customer Email',
            '3d_url_response': primaryCallbackUrl || '',
        };
        const base64_encode = generator_util_1.GeneratorUtil.generateMerchantKey();
        const configs = {
            url: constants_1.PAYSWITCH_TEST_BASEURL + '/v1.1/transaction/process',
            body: cpParams,
            headers: {
                Authorization: `Basic ${base64_encode}`,
            },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`CARD PAYMENT payload config == ${JSON.stringify(configs)}`);
        return this.httpService
            .post(configs.url, configs.body, {
            httpsAgent: configs.agent,
            headers: configs.headers,
        })
            .pipe((0, operators_1.map)((tmRes) => {
            this.logger.verbose(`CARD PAYMENT server response => ${JSON.stringify(tmRes.data)}`);
            if (tmRes.data.Status === 0) {
                this.logger.error(`debit wallet service response STATUS =  ${JSON.stringify(tmRes.data.Status)}`);
                this.logger.error(`service response MESSAGE =  ${JSON.stringify(tmRes.data.Message)}`);
                this.logger.error(`service response DETAILS = ${JSON.stringify(tmRes.data.Details)}`);
            }
            else if (tmRes.data.Status === 1) {
                this.logger.debug(`debit wallet  service response TRANSACTION ID == ${JSON.stringify(tmRes.data.Transactionid)}`);
                this.logger.debug(`service response STATUS ==  ${JSON.stringify(tmRes.data.Status)}`);
                this.logger.debug(`response MESSAGE ==  ${JSON.stringify(tmRes.data.Message)}`);
                this.logger.debug(`response MERCHANT REFERENCE == ${JSON.stringify(tmRes.data.MerchantReference)}`);
            }
            else if (tmRes.data.Status === 2) {
                this.logger.warn(`debit wallet service response STATUS =  ${JSON.stringify(tmRes.data.Status)}`);
                this.logger.warn(`service response MESSAGE =  ${JSON.stringify(tmRes.data.Message)}`);
                this.logger.warn(`service response TRANSACTIONID = ${JSON.stringify(tmRes.data.transactionid)}`);
            }
            return tmRes.data;
        }), (0, operators_1.catchError)((Sm2Error) => {
            this.logger.error(`ERROR CARD PAYMENT => ${JSON.stringify(Sm2Error.response.data)}`);
            const Sm2ErrorMessage = Sm2Error.response.data;
            throw new common_1.NotFoundException(Sm2ErrorMessage);
        }));
    }
};
exports.PscardpaymentService = PscardpaymentService;
exports.PscardpaymentService = PscardpaymentService = PscardpaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], PscardpaymentService);
//# sourceMappingURL=pscardpayment.service.js.map