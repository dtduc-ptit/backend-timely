import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { EventsController } from './modules/events/events.controller';
import { EventsService } from './modules/events/events.service';
<<<<<<< Updated upstream
=======
import { UsersController } from './modules/users/users.controller';
import { AdminUsersController } from './modules/users/admin-users.controller';
import { UsersService } from './modules/users/users.service';
import { RemindersService } from './modules/reminders/reminders.service';
import { RemindersController } from './modules/reminders/reminders.controller';
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],

<<<<<<< Updated upstream
  providers: [PrismaService, AuthService, EventsService],
  controllers: [AuthController, EventsController, EventsController],
  exports: [PrismaService, AuthService, EventsService],
=======
  providers: [
    PrismaService,
    AuthService,
    EventsService,
    UsersService,
    RemindersService,
  ],
  controllers: [
    AuthController,
    EventsController,
    EventsController,
    UsersController,
    AdminUsersController,
    RemindersController,
  ],
  exports: [
    PrismaService,
    AuthService,
    EventsService,
    UsersService,
    RemindersService,
  ],
>>>>>>> Stashed changes
})
export class AppModule {}
