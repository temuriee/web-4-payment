import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password for the account',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public password: string;
}
