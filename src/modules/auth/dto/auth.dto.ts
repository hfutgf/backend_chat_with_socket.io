import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Minimum password length 8 characters!' })
  password: string;
}
