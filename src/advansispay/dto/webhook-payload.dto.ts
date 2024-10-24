// dto/webhook-payload.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  'order-id': string;

  @IsString()
  @IsNotEmpty()
  token: string;
}