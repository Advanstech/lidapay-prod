import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResetPasswordDto{
    @ApiProperty({description: 'Email of the user'})
    @IsEmail()
    email: string;
    phoneNumber: string;
    identifier: any
}  
