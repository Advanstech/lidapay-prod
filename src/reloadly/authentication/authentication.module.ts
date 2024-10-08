import { Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [AuthenticationService],
  controllers: [AuthenticationController]
})
export class AuthenticationModule {
}
