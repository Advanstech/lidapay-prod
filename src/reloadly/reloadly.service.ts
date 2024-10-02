import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  RELOADLY_AUDIENCE_SANDBOX,
  RELOADLY_BASEURL,
  RELOADLY_BASEURL_SANDBOX,
  RELOADLY_CLIENT_ID_SANDBOX,
  RELOADLY_CLIENT_SECRET_SANDBOX,
  RELOADLY_GRANT_TYPE_SANDBOX,
  RELOADLY_TOKEN_SANDBOX
} from "../constants";
import { HttpService } from "@nestjs/axios";
import { catchError, map } from "rxjs/operators";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { AxiosError, AxiosResponse } from "axios";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
import { Observable } from "rxjs/internal/Observable";

@Injectable()
export class ReloadlyService {
  private logger = new Logger(ReloadlyService.name);
  private reloadLyBaseURL = RELOADLY_BASEURL_SANDBOX;
  private authURL = RELOADLY_BASEURL;

  constructor(
    private httpService: HttpService
  ) {
  }

  async accessToken(): Promise<Observable<any>> {
    this.logger.verbose(`ACCESS TOKEN LOADING ...`);
    // token payload
    const gatPayload = {
      client_id: RELOADLY_CLIENT_ID_SANDBOX,
      client_secret: RELOADLY_CLIENT_SECRET_SANDBOX,
      grant_type: RELOADLY_GRANT_TYPE_SANDBOX,
      audience: RELOADLY_AUDIENCE_SANDBOX
    };

    // Access URL
    const gatURL = `${this.authURL}/oauth/token`;

    // http config
    const config = {
      url: gatURL,
      body: gatPayload
    };
    this.logger.log(`Access token http configs == ${JSON.stringify(config)}`);

    return this.httpService
      .post(config.url, config.body)
      .pipe(
        map((gatRes) => {
          this.logger.debug(
            `ACCESS TOKEN HTTPS RESPONSE ++++ ${JSON.stringify(gatRes.data)}`
          );
          return gatRes.data;
        }),
        catchError((gatError) => {
          this.logger.error(`ERROR ACCESS TOKEN RESPONSE --- ${JSON.stringify(gatError.response.data)}`);
          const gatErrorMessage = gatError.response.data;
          throw new NotFoundException(gatErrorMessage);
        })
      );
  }

  /**
   * Get Reloadly account balance
   *
   * @returns {Promise<Observable<AxiosResponse<any>>>}
   * @memberof ReloadlyService
   */
  async getAccountBalance(): Promise<Observable<any>> {
    const url = `${this.reloadLyBaseURL}/accounts/balance`;

    const token = await this.reloadlyAccessToken();
    const headers = {
      Accept: 'application/com.reloadly.topups-v1+json',
      Authorization: `Bearer ${token}`,
    };

    return this.httpService.get<any>(url, { headers }).pipe(
      map((res: AxiosResponse<any>) => res.data),
      catchError((err: AxiosError) => {
        const errorMessage = err.response?.data;
        throw new NotFoundException(errorMessage);
      }),
    );
  }

  async countryList(): Promise<Observable<any>> {

    let accessToken = await this.reloadlyAccessToken();
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
  }

  findCountryByCode(reloadDto: ReloadlyDto): Observable<AxiosResponse<ReloadlyDto>> {
    const { countryCode } = reloadDto;

    let accessToken = this.accessToken();
    // let accessToken = 'eyJraWQiOiI1N2JjZjNhNy01YmYwLTQ1M2QtODQ0Mi03ODhlMTA4OWI3MDIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMzAyOSIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHktc2FuZGJveC5hdXRoMC5jb20vIiwiaHR0cHM6Ly9yZWxvYWRseS5jb20vc2FuZGJveCI6dHJ1ZSwiaHR0cHM6Ly9yZWxvYWRseS5jb20vcHJlcGFpZFVzZXJJZCI6IjIzMDI5IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXVkIjoiaHR0cHM6Ly90b3B1cHMtaHMyNTYtc2FuZGJveC5yZWxvYWRseS5jb20iLCJuYmYiOjE3MTY1NDI1MTUsImF6cCI6IjIzMDI5Iiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3MTY2Mjg5MTUsImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6ImRkZjExNzAyLTQ1MTktNDlhYy1iOTc5LWU4YzhkYTRmZWUxZCIsImlhdCI6MTcxNjU0MjUxNSwianRpIjoiMjQ1MTVhNDEtMmZkYi00MTRkLTliZDQtODc2ZTEyNTQyNTIzIn0._Pc0SuRPuXETMowD8k_mcNdc-KhPRWpbD113VrvgEZg';
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
      .pipe(
        map((clRes) => {
          this.logger.log(`COUNTRY ISO code ==> ${JSON.stringify(clRes.data)}`);
          return clRes.data;
        }),
        catchError((clError) => {
          this.logger.error(`COUNTRY ISO code ERROR ===> ${JSON.stringify(clError.response.data)}`);
          const clErrorMessage = clError.response.data;
          throw new NotFoundException(clErrorMessage);
        })
      );
  }

  networkOperators(netDto: NetworkOperatorsDto): Observable<AxiosResponse<NetworkOperatorsDto>> {

    const accessToken: any = RELOADLY_TOKEN_SANDBOX;
    // const accessToken = "eyJraWQiOiI1N2JjZjNhNy01YmYwLTQ1M2QtODQ0Mi03ODhlMTA4OWI3MDIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMzAyOSIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHktc2FuZGJveC5hdXRoMC5jb20vIiwiaHR0cHM6Ly9yZWxvYWRseS5jb20vc2FuZGJveCI6dHJ1ZSwiaHR0cHM6Ly9yZWxvYWRseS5jb20vcHJlcGFpZFVzZXJJZCI6IjIzMDI5IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXVkIjoiaHR0cHM6Ly90b3B1cHMtaHMyNTYtc2FuZGJveC5yZWxvYWRseS5jb20iLCJuYmYiOjE3MTY3OTk2MTMsImF6cCI6IjIzMDI5Iiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3MTY4ODYwMTMsImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6ImRkZjExNzAyLTQ1MTktNDlhYy1iOTc5LWU4YzhkYTRmZWUxZCIsImlhdCI6MTcxNjc5OTYxMywianRpIjoiNGE0NTU3MTMtZTg1ZS00YmY2LTk5MjQtOWEwZTY0NzhiZTgwIn0.ymHCUMNePx_w2xmOEBodg9eO1PnCXClLqLzuZJlmnwM";
    console.debug(`network operators ==> ${JSON.stringify(accessToken)}`);

    const {
      size,
      page,
      includeCombo,
      comboOnly,
      bundlesOnly,
      dataOnly,
      pinOnly
    } = netDto;

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

  }

  findOperatorById(fobDto: NetworkOperatorsDto): Observable<AxiosResponse<NetworkOperatorsDto>> {
    const { operatorId } = fobDto;

    let accessToken = RELOADLY_TOKEN_SANDBOX;
    // this.logger.log(`country access token ${JSON.stringify(accessToken)}`);

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
  }

  autoDetectOperator(adoDto: NetworkOperatorsDto): Observable<AxiosResponse<NetworkOperatorsDto>> {

    const { phone, countryIsoCode, accessToken } = adoDto;
    const adoPayload = {
      phone,
      countryisocode: countryIsoCode,
      accessToken: RELOADLY_TOKEN_SANDBOX,
      suggestedAmountsMap: true,
      suggestedAmount: false
    };

    // let accessToken = 'eyJraWQiOiI1N2JjZjNhNy01YmYwLTQ1M2QtODQ0Mi03ODhlMTA4OWI3MDIiLCJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMzAyOSIsImlzcyI6Imh0dHBzOi8vcmVsb2FkbHktc2FuZGJveC5hdXRoMC5jb20vIiwiaHR0cHM6Ly9yZWxvYWRseS5jb20vc2FuZGJveCI6dHJ1ZSwiaHR0cHM6Ly9yZWxvYWRseS5jb20vcHJlcGFpZFVzZXJJZCI6IjIzMDI5IiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXVkIjoiaHR0cHM6Ly90b3B1cHMtaHMyNTYtc2FuZGJveC5yZWxvYWRseS5jb20iLCJuYmYiOjE3MTY1NDI1MTUsImF6cCI6IjIzMDI5Iiwic2NvcGUiOiJzZW5kLXRvcHVwcyByZWFkLW9wZXJhdG9ycyByZWFkLXByb21vdGlvbnMgcmVhZC10b3B1cHMtaGlzdG9yeSByZWFkLXByZXBhaWQtYmFsYW5jZSByZWFkLXByZXBhaWQtY29tbWlzc2lvbnMiLCJleHAiOjE3MTY2Mjg5MTUsImh0dHBzOi8vcmVsb2FkbHkuY29tL2p0aSI6ImRkZjExNzAyLTQ1MTktNDlhYy1iOTc5LWU4YzhkYTRmZWUxZCIsImlhdCI6MTcxNjU0MjUxNSwianRpIjoiMjQ1MTVhNDEtMmZkYi00MTRkLTliZDQtODc2ZTEyNTQyNTIzIn0._Pc0SuRPuXETMowD8k_mcNdc-KhPRWpbD113VrvgEZg';
    // this.logger.log(`country access token ${JSON.stringify(accessToken)}`);

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
  }

  getOperatorByCode(gobcDto: NetworkOperatorsDto): Observable<AxiosResponse<NetworkOperatorsDto>> {

    const { countryIsoCode, accessToken } = gobcDto;

    const gobcPayload = {
      countrycode: countryIsoCode,
      accessToken: RELOADLY_TOKEN_SANDBOX || accessToken,
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
  }

  async fxRates(): Promise<any> {
  }

  private async reloadlyAccessToken(): Promise<any> {
    const tokenPayload = {
      client_id: RELOADLY_CLIENT_ID_SANDBOX,
      client_secret: RELOADLY_CLIENT_SECRET_SANDBOX,
      grant_type: RELOADLY_GRANT_TYPE_SANDBOX,
      audience: RELOADLY_AUDIENCE_SANDBOX,
    };

    const tokenUrl = `${this.authURL}/oauth/token`;

    try {
      const response = await this.httpService.post(tokenUrl, tokenPayload).toPromise();
      const accessToken = response.data.access_token;
      // this.logger.debug(`Access token generated: ${accessToken}`);
      return accessToken;
    } catch (error) {
      this.logger.error(`Error generating access token: ${error.message}`);
      throw new NotFoundException('Failed to generate access token');
    }
  }

}
