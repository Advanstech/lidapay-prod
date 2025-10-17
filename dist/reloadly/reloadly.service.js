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
var ReloadlyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadlyService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const axios_1 = require("@nestjs/axios");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
let ReloadlyService = ReloadlyService_1 = class ReloadlyService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(ReloadlyService_1.name);
        this.reloadLyBaseURL = constants_1.RELOADLY_BASEURL_LIVE;
        this.authURL = constants_1.RELOADLY_BASEURL;
    }
    accessToken() {
        this.logger.verbose(`ACCESS TOKEN LOADING ...`);
        const gatPayload = {
            client_id: constants_1.RELOADLY_CLIENT_ID,
            client_secret: constants_1.RELOADLY_CLIENT_SECRET,
            grant_type: constants_1.RELOADLY_GRANT_TYPE,
            audience: constants_1.RELOADLY_AUDIENCE
        };
        const gatURL = `${this.authURL}/oauth/token`;
        const config = {
            url: gatURL,
            body: gatPayload
        };
        this.logger.log(`Access token http configs == ${JSON.stringify(config)}`);
        return this.httpService
            .post(config.url, config.body)
            .pipe((0, operators_1.map)((gatRes) => {
            this.logger.debug(`ACCESS TOKEN HTTPS RESPONSE ++++ ${JSON.stringify(gatRes.data)}`);
            return gatRes.data;
        }), (0, operators_1.catchError)((gatError) => {
            this.logger.error(`ERROR ACCESS TOKEN RESPONSE --- ${JSON.stringify(gatError.response.data)}`);
            const gatErrorMessage = gatError.response.data;
            throw new common_1.NotFoundException(gatErrorMessage);
        }));
    }
    getAccountBalance() {
        return (0, rxjs_1.from)(this.reloadlyAccessToken()).pipe((0, operators_1.switchMap)(token => {
            const url = `${this.reloadLyBaseURL}/accounts/balance`;
            const headers = {
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${token}`,
            };
            return this.httpService.get(url, { headers }).pipe((0, operators_1.map)((res) => res.data), (0, operators_1.catchError)((err) => {
                const errorMessage = err.response?.data;
                this.logger.error(`GET ACCOUNT BALANCE ERROR ===> ${JSON.stringify(errorMessage)}`);
                throw new common_1.NotFoundException(errorMessage);
            }));
        }));
    }
    countryList() {
        return (0, rxjs_1.from)(this.reloadlyAccessToken()).pipe((0, operators_1.switchMap)(accessToken => {
            this.logger.debug(`country access token ${JSON.stringify(accessToken)}`);
            const clURL = `${this.reloadLyBaseURL}/countries`;
            const config = {
                url: clURL,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/com.reloadly.topups-v1+json",
                    Authorization: `Bearer ${accessToken}`
                }
            };
            console.debug("reload topup recharge: " + JSON.stringify(config));
            return this.httpService
                .get(config.url, { headers: config.headers })
                .pipe((0, operators_1.map)((clRes) => {
                this.logger.log(`COUNTRY LIST ==> ${JSON.stringify(clRes.data)}`);
                return clRes.data;
            }), (0, operators_1.catchError)((clError) => {
                this.logger.error(`COUNTRY LIST ERROR ===> ${JSON.stringify(clError.response.data)}`);
                const clErrorMessage = clError.response.data;
                throw new common_1.NotFoundException(clErrorMessage);
            }));
        }));
    }
    findCountryByCode(reloadDto) {
        const { countryCode } = reloadDto;
        return (0, rxjs_1.from)(this.accessToken()).pipe((0, operators_1.switchMap)(accessToken => {
            this.logger.log(`country access token ${JSON.stringify(accessToken)}`);
            const fcbURL = `${this.reloadLyBaseURL}/countries/${countryCode}`;
            const config = {
                url: fcbURL,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/com.reloadly.topups-v1+json",
                    Authorization: `Bearer ${accessToken}`
                }
            };
            console.log("find country byCode config: " + JSON.stringify(config));
            return this.httpService
                .get(config.url, { headers: config.headers })
                .pipe((0, operators_1.map)((fcbRes) => {
                this.logger.log(`COUNTRY BY CODE ==> ${JSON.stringify(fcbRes.data)}`);
                return fcbRes.data;
            }), (0, operators_1.catchError)((fcbError) => {
                this.logger.error(`COUNTRY BY CODE ERROR ===> ${JSON.stringify(fcbError.response.data)}`);
                const fcbErrorMessage = fcbError.response.data;
                throw new common_1.NotFoundException(fcbErrorMessage);
            }));
        }));
    }
    networkOperators(reloadDto) {
        const { size, page } = reloadDto || {};
        return (0, rxjs_1.from)(this.reloadlyAccessToken()).pipe((0, operators_1.switchMap)(accessToken => {
            const noPayload = {
                includeBundles: true,
                includeData: true,
                suggestedAmountsMap: false,
                size: size || 10,
                page: page || 2,
                includeCombo: false,
                comboOnly: false,
                bundlesOnly: false,
                dataOnly: false,
                pinOnly: false
            };
            const noURL = this.reloadLyBaseURL +
                `/operators?includeBundles=${noPayload.includeBundles}&includeData=${noPayload.includeData}&suggestedAmountsMap=${noPayload.suggestedAmountsMap}&size=${noPayload.size}&page=${noPayload.page}&includeCombo=${noPayload.includeCombo}&comboOnly=${noPayload.comboOnly}&bundlesOnly=${noPayload.bundlesOnly}&dataOnly=${noPayload.dataOnly}&pinOnly=${noPayload.pinOnly}`;
            const config = {
                url: noURL,
                headers: {
                    Accept: "application/com.reloadly.topups-v1+json",
                    Authorization: `Bearer ${accessToken}`
                }
            };
            this.logger.verbose(`NETWORK OPERATORS CONFIG ==> ${JSON.stringify(config)}`);
            return this.httpService
                .get(config.url, { headers: config.headers })
                .pipe((0, operators_1.map)((noRes) => {
                this.logger.log(`NETWORK OPERATORS LIST ==> ${JSON.stringify(noRes.data)}`);
                return noRes.data.content;
            }), (0, operators_1.catchError)((noError) => {
                this.logger.error(`NETWORK OPERATORS ERROR ==> ${JSON.stringify(noError.response.data)}`);
                const noErrorMessage = noError.response.data;
                throw new common_1.NotFoundException(noErrorMessage);
            }));
        }));
    }
    findOperatorById(fobDto) {
        const { operatorId } = fobDto;
        return (0, rxjs_1.from)(this.reloadlyAccessToken()).pipe((0, operators_1.switchMap)(accessToken => {
            const fobURL = `${this.reloadLyBaseURL}/operators/${operatorId}`;
            const config = {
                url: fobURL,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/com.reloadly.topups-v1+json",
                    Authorization: `Bearer ${accessToken}`
                }
            };
            console.log("FIND OPERATOR BY ID: " + JSON.stringify(config));
            return this.httpService
                .get(config.url, { headers: config.headers })
                .pipe((0, operators_1.map)((fobRes) => {
                this.logger.log(`OPERATOR ID RESPONSE ==> ${JSON.stringify(fobRes.data)}`);
                return fobRes.data;
            }), (0, operators_1.catchError)((fobError) => {
                this.logger.error(`OPERATOR ID ERROR ===> ${JSON.stringify(fobError.response.data)}`);
                const fobErrorMessage = fobError.response.data;
                throw new common_1.NotFoundException(fobErrorMessage);
            }));
        }));
    }
    autoDetectOperator(adoDto) {
        const { phone, countryIsoCode } = adoDto;
        return (0, rxjs_1.from)(this.reloadlyAccessToken()).pipe((0, operators_1.switchMap)(token => {
            const adoPayload = {
                phone,
                countryisocode: countryIsoCode,
                accessToken: token,
                suggestedAmountsMap: true,
                suggestedAmount: false
            };
            const adoURL = this.reloadLyBaseURL + `/operators/auto-detect/phone/${adoPayload.phone}/countries/${adoPayload.countryisocode}`;
            const config = {
                url: adoURL,
                headers: {
                    Accept: "application/com.reloadly.topups-v1+json",
                    Authorization: `Bearer ${adoPayload.accessToken}`
                }
            };
            console.log("Auto Detect Operator URL: " + JSON.stringify(config.url));
            console.log("Auto Detect Operator Headers: " + JSON.stringify(config.headers));
            return this.httpService
                .get(config.url, { headers: config.headers })
                .pipe((0, operators_1.map)((fobRes) => {
                this.logger.log(`AUTO DETECT OPERATOR RESPONSE ==> ${JSON.stringify(fobRes.data)}`);
                return fobRes.data;
            }), (0, operators_1.catchError)((fobError) => {
                this.logger.error(`AUTO DETECT OPERATOR ERROR ===> ${JSON.stringify(fobError.response.data)}`);
                const fobErrorMessage = fobError.response.data;
                throw new common_1.NotFoundException(fobErrorMessage);
            }));
        }));
    }
    getOperatorByCode(gobcDto) {
        const { countryIsoCode } = gobcDto;
        return (0, rxjs_1.from)(this.reloadlyAccessToken()).pipe((0, operators_1.switchMap)(token => {
            const gobcPayload = {
                countrycode: countryIsoCode,
                accessToken: token || '',
                suggestedAmountsMap: true,
                suggestedAmount: false,
                includePin: false,
                includeData: false,
                includeBundles: false,
                includeCombo: false,
                comboOnly: false,
                dataOnly: false,
                bundlesOnly: false,
                pinOnly: false
            };
            const gobcURL = this.reloadLyBaseURL +
                `/operators/countries/${gobcPayload.countrycode}?suggestedAmountsMap=${gobcPayload.suggestedAmount}&suggestedAmounts=${gobcPayload.suggestedAmount}&includePin=${gobcPayload.includePin}&includeData=${gobcPayload.includeData}&includeBundles=${gobcPayload.includeBundles}&includeCombo=${gobcPayload.includeCombo}&comboOnly=${gobcPayload.comboOnly}&bundlesOnly=${gobcPayload.bundlesOnly}&dataOnly=${gobcPayload.dataOnly}&pinOnly=${gobcPayload.pinOnly}`;
            const gobcConfig = {
                url: gobcURL,
                headers: {
                    Accept: "application/com.reloadly.topups-v1+json",
                    Authorization: `Bearer ${gobcPayload.accessToken}`
                }
            };
            console.log("Auto Detect Operator: " + JSON.stringify(gobcConfig));
            return this.httpService
                .get(gobcConfig.url, { headers: gobcConfig.headers })
                .pipe((0, operators_1.map)((fobRes) => {
                this.logger.log(`OPERATOR BYISOCODE RESPONSE ==> ${JSON.stringify(fobRes.data)}`);
                return fobRes.data;
            }), (0, operators_1.catchError)((gobcError) => {
                this.logger.error(`OPERATOR BYISOCODE ERROR ===> ${JSON.stringify(gobcError.response.data)}`);
                const gobcErrorMessage = gobcError.response.data;
                throw new common_1.NotFoundException(gobcErrorMessage);
            }));
        }));
    }
    async fxRates(params) {
        const { operatorId, amount, currencyCode } = params || {};
        if (!operatorId || !Number.isFinite(Number(operatorId))) {
            throw new common_1.NotFoundException('operatorId is required and must be a number');
        }
        if (!amount || !Number.isFinite(Number(amount))) {
            throw new common_1.NotFoundException('amount is required and must be a number');
        }
        const token = await this.reloadlyAccessToken();
        const baseUrl = `${this.reloadLyBaseURL}/operators/${operatorId}/fx-rate`;
        const query = new URLSearchParams({ amount: String(amount) });
        if (currencyCode) {
            query.set('currencyCode', String(currencyCode).toUpperCase());
        }
        const url = `${baseUrl}?${query.toString()}`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${token}`,
        };
        try {
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            this.logger.debug(`FX RATE RESPONSE ==> ${JSON.stringify(res.data)}`);
            return res.data;
        }
        catch (err) {
            this.logger.error(`FX RATE ERROR ===> ${JSON.stringify(err?.response?.data || err?.message)}`);
            const message = err?.response?.data || 'Failed to fetch FX rate';
            throw new common_1.NotFoundException(message);
        }
    }
    async reloadlyAccessToken() {
        const tokenPayload = {
            client_id: constants_1.RELOADLY_CLIENT_ID,
            client_secret: constants_1.RELOADLY_CLIENT_SECRET,
            grant_type: constants_1.RELOADLY_GRANT_TYPE,
            audience: constants_1.RELOADLY_AUDIENCE,
        };
        const tokenUrl = `${this.authURL}/oauth/token`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(tokenUrl, tokenPayload));
            const accessToken = response.data.access_token;
            this.logger.debug(`[ACCESS TOKEN]==> response ${JSON.stringify(accessToken)}`);
            return accessToken;
        }
        catch (error) {
            this.logger.error(`Error generating [ACCESS TOKEN]: ${error.message}`);
            throw new common_1.NotFoundException('Failed to generate access token');
        }
    }
};
exports.ReloadlyService = ReloadlyService;
exports.ReloadlyService = ReloadlyService = ReloadlyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ReloadlyService);
//# sourceMappingURL=reloadly.service.js.map