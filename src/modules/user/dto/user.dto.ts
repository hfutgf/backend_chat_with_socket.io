import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Minimum password length 8 characters!' })
  password: string;

  @IsString()
  name: string;
}
