import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  password: string;

  @IsString()
  name?: string;
}
