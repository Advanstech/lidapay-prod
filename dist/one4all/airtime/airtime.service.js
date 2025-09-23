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
var AirtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtimeService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const https = require("https");
const constants_1 = require("../../constants");
const transaction_service_1 = require("../../transaction/transaction.service");
const generator_util_1 = require("../../utilities/generator.util");
let AirtimeService = AirtimeService_1 = class AirtimeService {
    constructor(httpService, transService) {
        this.httpService = httpService;
        this.transService = transService;
        this.logger = new common_1.Logger(AirtimeService_1.name);
        this.AirBaseUrl = process.env.ONE4ALL_BASEURL || constants_1.ONE4ALL_BASEURL;
        this.ONE4ALL_RETAILER = process.env.ONE4ALL_RETAILER || constants_1.ONE4ALL_RETAILER;
        this.ONE4ALL_APIKEY = process.env.ONE4ALL_APIKEY || constants_1.ONE4ALL_APIKEY;
        this.ONE4ALL_APISECRET = process.env.ONE4ALL_APISECRET || constants_1.ONE4ALL_APISECRET;
    }
    transactionStatus(transDto) {
        const { transReference } = transDto;
        const payload = {
            trnx: transReference || '',
        };
        const tsUrl = this.AirBaseUrl + `/TopUpApi/transactionStatus?trnx=${payload.trnx}`;
        const configs = {
            url: tsUrl,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`transaction status payload == ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((tsRes) => {
            this.logger.log(`Query TRANSACTION STATUS response ++++ ${JSON.stringify(tsRes.data)}`);
            return tsRes.data;
        }), (0, operators_1.catchError)((tsError) => {
            this.logger.error(`Query TRANSACTION STATUS ERROR response ---- ${JSON.stringify(tsError.response.data)}`);
            const tsErrorMessage = tsError.response.data;
            throw new common_1.NotFoundException(tsErrorMessage);
        }));
    }
    async topupAirtimeService(transDto) {
        this.logger.log(`=== AIRTIME SERVICE PROCESSING START ===`);
        this.logger.log(`Service received DTO: ${JSON.stringify(transDto, null, 2)}`);
        const { retailer, recipientNumber, amount, network, userId, userName, currency } = transDto;
        this.logger.debug(`Incoming DTO: ${JSON.stringify(transDto, null, 2)}`);
        this.logger.log(`Extracted parameters:`);
        this.logger.log(`  - retailer: "${retailer}" (type: ${typeof retailer})`);
        this.logger.log(`  - recipientNumber: "${recipientNumber}" (type: ${typeof recipientNumber})`);
        this.logger.log(`  - amount: "${amount}" (type: ${typeof amount})`);
        this.logger.log(`  - network: ${network} (type: ${typeof network})`);
        this.logger.log(`  - userId: "${userId}" (type: ${typeof userId})`);
        this.logger.log(`  - userName: "${userName}" (type: ${typeof userName})`);
        this.logger.log(`  - currency: "${currency}" (type: ${typeof currency})`);
        this.logger.log(`=== VALIDATION PHASE ===`);
        if (amount === undefined || amount === null || amount === '') {
            this.logger.error('Amount is required and cannot be empty');
            throw new common_1.BadRequestException('Amount is required and cannot be empty');
        }
        this.logger.log(`✅ Amount presence check passed`);
        let amountStr;
        this.logger.log(`Processing amount value: "${amount}" (type: ${typeof amount})`);
        if (typeof amount === 'string') {
            amountStr = amount.trim();
            this.logger.log(`Amount is string, trimmed to: "${amountStr}"`);
            if (amountStr === '') {
                this.logger.error('Amount string is empty after trimming');
                throw new common_1.BadRequestException('Amount cannot be empty');
            }
        }
        else if (typeof amount === 'number') {
            amountStr = amount.toString();
            this.logger.log(`Amount is number, converted to string: "${amountStr}"`);
        }
        else {
            this.logger.error(`Invalid amount type: ${typeof amount}`);
            throw new common_1.BadRequestException('Amount must be a string or number');
        }
        this.logger.log(`Final amount string: "${amountStr}"`);
        const amountNum = parseFloat(amountStr);
        this.logger.log(`Parsed amount number: ${amountNum}`);
        if (isNaN(amountNum) || amountNum <= 0) {
            this.logger.error(`Invalid amount provided: ${amountStr}`);
            throw new common_1.BadRequestException('Invalid amount. Please provide a valid positive number.');
        }
        this.logger.log(`✅ Amount validation passed: ${amountNum}`);
        if (!recipientNumber || recipientNumber.trim() === '') {
            this.logger.error('Recipient number is required');
            throw new common_1.BadRequestException('Recipient number is required');
        }
        this.logger.log(`✅ Recipient number validation passed: "${recipientNumber}"`);
        if (!userId || userId.trim() === '') {
            this.logger.error('User ID is required');
            throw new common_1.BadRequestException('User ID is required');
        }
        this.logger.log(`✅ User ID validation passed: "${userId}"`);
        if (!userName || userName.trim() === '') {
            this.logger.error('User name is required');
            throw new common_1.BadRequestException('User name is required');
        }
        this.logger.log(`✅ User name validation passed: "${userName}"`);
        this.logger.log(`=== FEE CALCULATION ===`);
        const fee = typeof constants_1.FEE_CHARGES === 'string' ? parseFloat(constants_1.FEE_CHARGES) : typeof constants_1.FEE_CHARGES === 'number' ? constants_1.FEE_CHARGES : 0;
        const totalAmount = (amountNum + fee).toFixed(2);
        this.logger.log(`  - Original amount: ${amountNum}`);
        this.logger.log(`  - Fee charges: ${fee}`);
        this.logger.log(`  - Total amount: ${totalAmount}`);
        this.logger.log(`=== BUILDING TRANSACTION PARAMS ===`);
        const taParams = {
            userId: userId,
            userName: userName,
            transType: 'AIRTIME',
            retailer: retailer ?? 'PRYMO',
            network: network || 0,
            operator: this.getOperatorName(network || 0),
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || '',
            transId: '',
            monetary: {
                amount: totalAmount,
                fee: fee,
                originalAmount: amountNum.toFixed(2),
                currency: currency || 'GHS',
                balance_before: '',
                balance_after: '',
                currentBalance: '',
            },
            status: {
                transaction: 'pending',
                service: 'pending',
                payment: 'pending',
            },
            recipientNumber: recipientNumber || '',
            transMessage: `${userName} topup airtime ${amountStr} GHS for ${this.getOperatorName(network)} to ${recipientNumber}`,
            commentary: 'Airtime topup transaction pending',
        };
        this.logger.log(`Transaction parameters built:`);
        this.logger.log(`  - Transaction ID: ${taParams.trxn}`);
        this.logger.log(`  - Operator: ${taParams.operator}`);
        this.logger.log(`  - Transaction message: ${taParams.transMessage}`);
        this.logger.log(`  - Monetary details: ${JSON.stringify(taParams.monetary, null, 2)}`);
        try {
            this.logger.log(`=== SAVING TRANSACTION ===`);
            await this.transService.create(taParams);
            this.logger.log(`✅ Transaction saved successfully with ID: ${taParams.trxn}`);
            const savedTransaction = await this.transService.findByTrxn(taParams.trxn);
            this.logger.log(`Retrieved saved transaction: ${JSON.stringify(savedTransaction, null, 2)}`);
            if (!savedTransaction) {
                this.logger.error('Failed to save transaction.');
                throw new common_1.InternalServerErrorException('Transaction could not be created.');
            }
            this.logger.log(`✅ Transaction retrieval confirmed`);
        }
        catch (error) {
            this.logger.error(`Failed to create or save transaction: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to process transaction. Please try again.');
        }
        this.logger.log(`=== PREPARING API CALL ===`);
        const configs = {
            url: this.AirBaseUrl + `/TopUpApi/airtime?retailer=${constants_1.ONE4ALL_RETAILER}&recipient=${taParams.recipientNumber}&amount=${taParams.monetary.amount}&network=${taParams.network}&trxn=${taParams.trxn}`,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`API call configuration:`);
        this.logger.log(`  - Base URL: ${this.AirBaseUrl}`);
        this.logger.log(`  - Endpoint: /TopUpApi/airtime`);
        this.logger.log(`  - Retailer: ${constants_1.ONE4ALL_RETAILER}`);
        this.logger.log(`  - Recipient: ${taParams.recipientNumber}`);
        this.logger.log(`  - Amount: ${taParams.monetary.amount}`);
        this.logger.log(`  - Network: ${taParams.network}`);
        this.logger.log(`  - Transaction ID: ${taParams.trxn}`);
        this.logger.log(`  - Full URL: ${configs.url}`);
        this.logger.log(`  - Headers: ${JSON.stringify(configs.headers, null, 2)}`);
        this.logger.log(`Airtime topup payload == ${JSON.stringify(configs)}`);
        this.logger.log(`=== AIRTIME SERVICE PROCESSING END ===`);
        return this.httpService
            .get(configs.url, {
            httpsAgent: configs.agent,
            headers: configs.headers,
        })
            .pipe((0, operators_1.map)((taRes) => {
            this.logger.verbose(`AIRTIME TOPUP response ++++ ${JSON.stringify(taRes.data)}`);
            if (taRes.data['status-code'] === '00') {
                this.logger.verbose(`airtime topup successful`);
                this.transService.updateByTrxn(taParams.trxn, {
                    ...taParams,
                    status: {
                        transaction: 'completed',
                        service: 'completed',
                        payment: 'completed',
                    },
                    commentary: `Airtime topup successful delivered to ${taParams.recipientNumber}`,
                });
            }
            else {
                this.logger.warn(`Transaction status code: ${taRes.data['status-code']}`);
                this.transService.updateByTrxn(taParams.trxn, {
                    ...taParams,
                    status: {
                        transaction: 'failed',
                        service: 'failed',
                        payment: 'failed',
                    },
                    commentary: 'Airtime topup failed',
                });
            }
            return taRes.data;
        }), (0, operators_1.catchError)(async (taError) => {
            if (taError.response) {
                this.logger.error(`AIRTIME TOP-UP ERROR response --- ${JSON.stringify(taError.response.data)}`);
            }
            else {
                this.logger.error(`AIRTIME TOP-UP ERROR response --- No response data available`);
            }
            const taErrorMessage = taError.response?.data?.message || 'Unknown error occurred';
            try {
                const updateResult = await this.transService.updateByTrxn(String(taParams.trxn), {
                    ...taParams,
                    status: {
                        transaction: 'failed',
                        service: 'failed',
                        payment: 'failed',
                    },
                    commentary: taErrorMessage,
                });
                if (!updateResult) {
                    this.logger.warn(`Transaction with ID ${taParams.trxn} not found for update.`);
                }
            }
            catch (updateError) {
                this.logger.error(`Failed to update transaction: ${updateError.message}`);
            }
            this.logger.error(`Error message: ${taErrorMessage}`);
            return {
                status: 'FAIL',
                message: taErrorMessage,
                error: taError.response?.data || {},
                transactionId: taParams.trxn,
            };
        }));
    }
    getOperatorName(networkCode) {
        const operators = {
            0: 'Unknown (auto detect network)',
            1: 'AirtelTigo',
            2: 'EXPRESSO',
            3: 'GLO',
            4: 'MTN',
            5: 'TiGO',
            6: 'Telecel',
            8: 'Busy',
            9: 'Surfline'
        };
        return operators[networkCode] || 'Unknown';
    }
};
exports.AirtimeService = AirtimeService;
exports.AirtimeService = AirtimeService = AirtimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], AirtimeService);
//# sourceMappingURL=airtime.service.js.map