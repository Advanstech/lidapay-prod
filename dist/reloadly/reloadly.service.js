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
let ReloadlyService = ReloadlyService_1 = class ReloadlyService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(ReloadlyService_1.name);
        this.reloadLyBaseURL = constants_1.RELOADLY_BASEURL_SANDBOX;
        this.authURL = constants_1.RELOADLY_BASEURL;
    }
    async accessToken() {
        this.logger.verbose(`ACCESS TOKEN LOADING ...`);
        const gatPayload = {
            client_id: constants_1.RELOADLY_CLIENT_ID_SANDBOX,
            client_secret: constants_1.RELOADLY_CLIENT_SECRET_SANDBOX,
            grant_type: constants_1.RELOADLY_GRANT_TYPE_SANDBOX,
            audience: constants_1.RELOADLY_AUDIENCE_SANDBOX
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
    async getAccountBalance() {
        const url = `${this.reloadLyBaseURL}/accounts/balance`;
        const token = await this.reloadlyAccessToken();
        const headers = {
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${token}`,
        };
        return this.httpService.get(url, { headers }).pipe((0, operators_1.map)((res) => res.data), (0, operators_1.catchError)((err) => {
            const errorMessage = err.response?.data;
            throw new common_1.NotFoundException(errorMessage);
        }));
    }
    countryList() {
        let accessToken = this.accessToken();
        this.logger.debug(`country access token ${JSON.stringify(accessToken)}`);
        const clURL = `https://topups-sandbox.reloadly.com/countries`;
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
    }
    findCountryByCode(reloadDto) {
        const { countryCode } = reloadDto;
        let accessToken = this.accessToken();
        this.logger.log(`country access token ${JSON.stringify(accessToken)}`);
        const fcbURL = `https://topups-sandbox.reloadly.com/countries/${countryCode}`;
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
            .pipe((0, operators_1.map)((clRes) => {
            this.logger.log(`COUNTRY ISO code ==> ${JSON.stringify(clRes.data)}`);
            return clRes.data;
        }), (0, operators_1.catchError)((clError) => {
            this.logger.error(`COUNTRY ISO code ERROR ===> ${JSON.stringify(clError.response.data)}`);
            const clErrorMessage = clError.response.data;
            throw new common_1.NotFoundException(clErrorMessage);
        }));
    }
    networkOperators(netDto) {
        const accessToken = constants_1.RELOADLY_TOKEN_SANDBOX;
        console.debug(`network operators ==> ${JSON.stringify(accessToken)}`);
        const { size, page, includeCombo, comboOnly, bundlesOnly, dataOnly, pinOnly } = netDto;
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
        const noURL = this.reloadLyBaseURL + `/operators?includeBundles=${noPayload.includeBundles}&includeData=${noPayload.includeData}&suggestedAmountsMap=${noPayload.suggestedAmountsMap}&size=${noPayload.size}&page=${noPayload.page}&includeCombo=${noPayload.includeCombo}&comboOnly=${noPayload.comboOnly}&bundlesOnly=${noPayload.bundlesOnly}&dataOnly=${noPayload.dataOnly}&pinOnly=${noPayload.pinOnly}`;
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
    }
    findOperatorById(fobDto) {
        const { operatorId } = fobDto;
        let accessToken = constants_1.RELOADLY_TOKEN_SANDBOX;
        const fobURL = `https://topups-sandbox.reloadly.com/operators/${operatorId}`;
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
    }
    autoDetectOperator(adoDto) {
        const { phone, countryIsoCode, accessToken } = adoDto;
        const adoPayload = {
            phone,
            countryisocode: countryIsoCode,
            accessToken: constants_1.RELOADLY_TOKEN_SANDBOX,
            suggestedAmountsMap: true,
            suggestedAmount: false
        };
        const adoURL = this.reloadLyBaseURL + `/operators/auto-detect/phone/${adoPayload.phone}/countries/${adoPayload.countryisocode}?suggestedAmountsMap=${adoPayload.suggestedAmountsMap}&suggestedAmounts=${adoPayload.suggestedAmount}`;
        const config = {
            url: adoURL,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/com.reloadly.topups-v1+json",
                Authorization: `Bearer ${adoPayload.accessToken}`
            }
        };
        console.log("Auto Detect Operator: " + JSON.stringify(config));
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
    }
    getOperatorByCode(gobcDto) {
        const { countryIsoCode, accessToken } = gobcDto;
        const gobcPayload = {
            countrycode: countryIsoCode,
            accessToken: constants_1.RELOADLY_TOKEN_SANDBOX || accessToken,
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
    }
    async fxRates() {
    }
    async reloadlyAccessToken() {
        const tokenPayload = {
            client_id: constants_1.RELOADLY_CLIENT_ID_SANDBOX,
            client_secret: constants_1.RELOADLY_CLIENT_SECRET_SANDBOX,
            grant_type: constants_1.RELOADLY_GRANT_TYPE_SANDBOX,
            audience: constants_1.RELOADLY_AUDIENCE_SANDBOX,
        };
        const tokenUrl = `${this.authURL}/oauth/token`;
        try {
            const response = await this.httpService.post(tokenUrl, tokenPayload).toPromise();
            const accessToken = response.data.access_token;
            return accessToken;
        }
        catch (error) {
            this.logger.error(`Error generating access token: ${error.message}`);
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