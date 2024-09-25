import { HttpService } from "@nestjs/axios";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";
import { AuthenticationDto } from "./dto/authentication.dto";
export declare class AuthenticationService {
    private httpService;
    private logger;
    private reloadLyBaseURL;
    constructor(httpService: HttpService);
    genAccessToken(authDto: AuthenticationDto): Observable<AxiosResponse<AuthenticationDto>>;
}
