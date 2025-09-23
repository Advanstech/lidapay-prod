import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";
import {
  RELOADLY_AUDIENCE,
  RELOADLY_BASEURL,
  RELOADLY_CLIENT_ID,
  RELOADLY_CLIENT_SECRET, RELOADLY_GRANT_TYPE
} from "../../constants";
import * as https from 'https';
import { catchError, map } from "rxjs/operators";
import { AuthenticationDto } from "./dto/authentication.dto";

@Injectable()
export class AuthenticationService {
  private logger = new Logger(AuthenticationService.name);
  private reloadLyBaseURL = process.env.RELOADLY_BASEURL || RELOADLY_BASEURL;

  constructor(
    private httpService: HttpService
  ) {
  }

  genAccessToken(
    authDto: AuthenticationDto,
  ): Observable<AxiosResponse<AuthenticationDto>> {
    const { grantType, audience } = authDto;

    const authConfig = {
      clientId: process.env.RELOADLY_CLIENT_ID || RELOADLY_CLIENT_ID,
      clientSecret: process.env.RELOADLY_CLIENT_SECRET || RELOADLY_CLIENT_SECRET,
      grantType: process.env.RELOADLY_GRANT_TYPE || RELOADLY_GRANT_TYPE || grantType,
      audience: process.env.RELOADLY_AUDIENCE || RELOADLY_AUDIENCE || audience,
    };

    const requestConfig = {
      url: `${this.reloadLyBaseURL}/oauth/token`,
      body: authConfig,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };

    return this.httpService
      .post(requestConfig.url, requestConfig.body, { httpsAgent: requestConfig.httpsAgent })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          const errorMessage = error.response.data;
          throw new NotFoundException(errorMessage);
        }),
      );
  }
}
