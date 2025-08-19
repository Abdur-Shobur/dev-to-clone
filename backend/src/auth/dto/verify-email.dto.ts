import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'verification-token-here',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
