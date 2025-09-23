import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { RELOADLY_BASEURL, RELOADLY_AUDIENCE, RELOADLY_CLIENT_ID, RELOADLY_CLIENT_SECRET, RELOADLY_GRANT_TYPE, RELOADLY_BASEURL_LIVE } from "../constants";
import { HttpService } from "@nestjs/axios";
import { catchError, map, switchMap } from "rxjs/operators";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { AxiosError, AxiosResponse } from "axios";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
import { Observable, from, firstValueFrom } from "rxjs";

@Injectable()
export class ReloadlyService {
  private readonly logger = new Logger(ReloadlyService.name);
  private readonly reloadLyBaseURL: string;
  private readonly authURL: string;

  constructor(private readonly httpService: HttpService) {
    this.reloadLyBaseURL = RELOADLY_BASEURL_LIVE;
    this.authURL = RELOADLY_BASEURL;
  }
  // Access Token
  accessToken(): Observable<any> {
    this.logger.verbose(`ACCESS TOKEN LOADING ...`);
    const gatPayload = {
      client_id: RELOADLY_CLIENT_ID,
      client_secret: RELOADLY_CLIENT_SECRET,
      grant_type: RELOADLY_GRANT_TYPE,
      audience: RELOADLY_AUDIENCE
    };

    const gatURL = `${this.authURL}/oauth/token`;
    const config = {
      url: gatURL,
      body: gatPayload
    };

    this.logger.log(`Access token http configs == ${JSON.stringify(config)}`);

    return this.httpService
      .post(config.url, config.body)
      .pipe(
        map((gatRes) => {
          this.logger.debug(`ACCESS TOKEN HTTPS RESPONSE ++++ ${JSON.stringify(gatRes.data)}`);
          return gatRes.data;
        }),
        catchError((gatError) => {
          this.logger.error(`ERROR ACCESS TOKEN RESPONSE --- ${JSON.stringify(gatError.response.data)}`);
          const gatErrorMessage = gatError.response.data;
          throw new NotFoundException(gatErrorMessage);
        })
      );
  }
  // Get Account Balance
  getAccountBalance(): Observable<any> {
    return from(this.reloadlyAccessToken()).pipe(
      switchMap(token => {
        const url = `${this.reloadLyBaseURL}/accounts/balance`;
        const headers = {
          Accept: 'application/com.reloadly.topups-v1+json',
          Authorization: `Bearer ${token}`,
        };

        return this.httpService.get(url, { headers }).pipe(
          map((res) => res.data),
          catchError((err) => {
            const errorMessage = err.response?.data;
            throw new NotFoundException(errorMessage);
          })
        );
      })
    );
  }
  // Country List
  countryList(): Observable<any> {
    return from(this.reloadlyAccessToken()).pipe(
      switchMap(accessToken => {
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
          .pipe(
            map((clRes) => {
              this.logger.log(`COUNTRY LIST ==> ${JSON.stringify(clRes.data)}`);
              return clRes.data;
            }),
            catchError((clError) => {
              this.logger.error(`COUNTRY LIST ERROR ===> ${JSON.stringify(clError.response.data)}`);
              const clErrorMessage = clError.response.data;
              throw new NotFoundException(clErrorMessage);
            })
          );
      })
    );
  }
  // Find Country By Code
  findCountryByCode(reloadDto: ReloadlyDto): Observable<any> {
    const { countryCode } = reloadDto;

    return from(this.accessToken()).pipe(
      switchMap(accessToken => {
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
          .pipe(
            map((fcbRes) => {
              this.logger.log(`COUNTRY BY CODE ==> ${JSON.stringify(fcbRes.data)}`);
              return fcbRes.data;
            }),
            catchError((fcbError) => {
              this.logger.error(`COUNTRY BY CODE ERROR ===> ${JSON.stringify(fcbError.response.data)}`);
              const fcbErrorMessage = fcbError.response.data;
              throw new NotFoundException(fcbErrorMessage);
            })
          );
      })
    );
  }
  // Network Operators
  networkOperators(reloadDto?: { size?: number; page?: number }): Observable<any> {
    const { size, page } = reloadDto || {};

    return from(this.reloadlyAccessToken()).pipe(
      switchMap(accessToken => {
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
          .pipe(
            map((noRes) => {
              this.logger.log(`NETWORK OPERATORS LIST ==> ${JSON.stringify(noRes.data)}`);
              return noRes.data.content;
            }),
            catchError((noError) => {
              this.logger.error(`NETWORK OPERATORS ERROR ==> ${JSON.stringify(noError.response.data)
                }`
              );
              const noErrorMessage = noError.response.data;
              throw new NotFoundException(noErrorMessage);
            })
          );
      })
    );
  }
  // Find Operator By Id
  findOperatorById(fobDto: NetworkOperatorsDto): Observable<any> {
    const { operatorId } = fobDto;

    return from(this.reloadlyAccessToken()).pipe(
      switchMap(accessToken => {
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
          .pipe(
            map((fobRes) => {
              this.logger.log(`OPERATOR ID RESPONSE ==> ${JSON.stringify(fobRes.data)}`);
              return fobRes.data;
            }),
            catchError((fobError) => {
              this.logger.error(`OPERATOR ID ERROR ===> ${JSON.stringify(fobError.response.data)}`);
              const fobErrorMessage = fobError.response.data;
              throw new NotFoundException(fobErrorMessage);
            })
          );
      })
    );
  }
  // Auto Detect Operator
  autoDetectOperator(adoDto: NetworkOperatorsDto): Observable<AxiosResponse<NetworkOperatorsDto>> {
    const { phone, countryIsoCode } = adoDto;

    return from(this.reloadlyAccessToken()).pipe(
      switchMap(token => {
        const adoPayload = {
          phone,
          countryisocode: countryIsoCode,
          accessToken: token,
          suggestedAmountsMap: true,
          suggestedAmount: false
        };

        const adoURL = this.reloadLyBaseURL + `/operators/auto-detect/phone/${adoPayload.phone}/countries/${adoPayload.countryisocode}?suggestedAmountsMap=${adoPayload.suggestedAmountsMap}&suggestedAmounts=${adoPayload.suggestedAmount}`;
        console.log("adoURL params =>", adoURL);

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
          .pipe(
            map((fobRes) => {
              this.logger.log(`AUTO DETECT OPERATOR RESPONSE ==> ${JSON.stringify(fobRes.data)}`);
              return fobRes.data;
            }),
            catchError((fobError) => {
              this.logger.error(`AUTO DETECT OPERATOR ERROR ===> ${JSON.stringify(fobError.response.data)}`);
              const fobErrorMessage = fobError.response.data;
              throw new NotFoundException(fobErrorMessage);
            })
          );
      })
    );
  }
  // Get Operator by code
  getOperatorByCode(gobcDto: NetworkOperatorsDto): Observable<any> {
    const { countryIsoCode } = gobcDto;

    return from(this.reloadlyAccessToken()).pipe(
      switchMap(token => {
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
          .pipe(
            map((fobRes) => {
              this.logger.log(`OPERATOR BYISOCODE RESPONSE ==> ${JSON.stringify(fobRes.data)}`);
              return fobRes.data;
            }),
            catchError((gobcError) => {
              this.logger.error(`OPERATOR BYISOCODE ERROR ===> ${JSON.stringify(gobcError.response.data)}`);
              const gobcErrorMessage = gobcError.response.data;
              throw new NotFoundException(gobcErrorMessage);
            })
          );
      })
    );
  }
  // fxRates - Fetch FX rate for a given operator and amount
  async fxRates(params: { operatorId: number; amount: number; currencyCode?: string }): Promise<any> {
    const { operatorId, amount, currencyCode } = params || ({} as any);

    if (!operatorId || !Number.isFinite(Number(operatorId))) {
      throw new NotFoundException('operatorId is required and must be a number');
    }
    if (!amount || !Number.isFinite(Number(amount))) {
      throw new NotFoundException('amount is required and must be a number');
    }

    const token = await this.reloadlyAccessToken();

    // According to Reloadly docs, FX rate endpoint is under operators
    // GET /operators/{operatorId}/fx-rate?amount={amount}&currencyCode={optional}
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
      const res = await firstValueFrom(this.httpService.get(url, { headers }));
      this.logger.debug(`FX RATE RESPONSE ==> ${JSON.stringify(res.data)}`);
      return res.data;
    } catch (err: any) {
      this.logger.error(`FX RATE ERROR ===> ${JSON.stringify(err?.response?.data || err?.message)}`);
      const message = err?.response?.data || 'Failed to fetch FX rate';
      throw new NotFoundException(message);
    }
  }

  // Get Access Token
  private async reloadlyAccessToken(): Promise<string> {
    const tokenPayload = {
      client_id: RELOADLY_CLIENT_ID,
      client_secret: RELOADLY_CLIENT_SECRET,
      grant_type: RELOADLY_GRANT_TYPE,
      audience: RELOADLY_AUDIENCE,
    };

    const tokenUrl = `${this.authURL}/oauth/token`;

    try {
      const response = await firstValueFrom(this.httpService.post(tokenUrl, tokenPayload));
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      this.logger.error(`Error generating access token: ${error.message}`);
      throw new NotFoundException('Failed to generate access token');
    }
  }
}