import { AuthenticationService } from "./authentication.service";
import { AuthenticationDto } from "./dto/authentication.dto";
export declare class AuthenticationController {
    private authService;
    private logger;
    constructor(authService: AuthenticationService);
    genAuthentication(authDto: AuthenticationDto): Promise<any>;
}
