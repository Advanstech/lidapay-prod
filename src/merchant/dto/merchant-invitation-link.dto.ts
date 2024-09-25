import { ApiProperty } from '@nestjs/swagger';

export class MerchantInvitationLinkDto {
  @ApiProperty()
  usageCount: number;

  @ApiProperty({ type: Date, nullable: true })
  lastUsed: Date | null;
}