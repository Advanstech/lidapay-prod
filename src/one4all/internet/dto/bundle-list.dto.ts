import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class BundleListDto {
  @ApiProperty({ 
    description: 'Network code (0-9) 1: AirtelTigo, 4: MTN, 5: Telecel, 6: Telecel, 7: Glo, 8: Expresso, 9: Busy',
    example: 4,
    required: false,
    minimum: 0,
    maximum: 9
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  network?: number;
}
