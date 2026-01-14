import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @MinLength(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự' })
  name?: string;

  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  role?: Role;
}
