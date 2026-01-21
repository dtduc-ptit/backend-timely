import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/authResponse.dto';
import { plainToInstance } from 'class-transformer';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: UserResponseDto }> {
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: dto.role ?? 'USER',
      },
    });

    return {
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async login(dto: LoginDto): Promise<{
    user: UserResponseDto;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.validateUserCredentials(dto);

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.generateToken(user.id, user.role, 900);
    const refresh_token = await this.generateToken(user.id, user.role, 604800);

    return {
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
      access_token,
      refresh_token,
    };
  }

  async validateUserCredentials(loginDto: LoginDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }
    return user;
  }

  async generateToken(
    userId: number,
    role: Role,
    accessTime: number,
  ): Promise<string> {
    return this.jwtService.sign(
      { sub: userId, role: role },
      { expiresIn: `${accessTime}s` },
    );
  }
}
