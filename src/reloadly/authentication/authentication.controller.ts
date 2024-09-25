import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { TransStatusDto } from "../../one4all/airtime/dto/transtatus.dto";
import { AuthenticationDto } from "./dto/authentication.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reloadly Authentication')
@Controller('api/v1/auth')
export class AuthenticationController {
  private logger = new Logger(AuthenticationController.name);

  constructor(
    private authService: AuthenticationService
  ) {
  }

  @Post('/access-token')
  @ApiBody({ type: AuthenticationDto })
  @ApiOperation({ summary: 'Generate a Reloadly access token' })
  @ApiResponse({
    status: 200,
    description: 'The generated access token',
    type: String,
  })
  public async genAuthentication(
    @Body() authDto: AuthenticationDto,
  ): Promise<any> {
    this.logger.log(`auth dto => ${JSON.stringify(authDto)}`);
    const authToken = await this.authService.genAccessToken(authDto);
    return authToken;
  }


}
