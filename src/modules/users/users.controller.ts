import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { CurrentUser } from 'src/common/decorators/auth.decorators';
import { UpdateProfileDto } from './dto/update-profile.dto';


@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  updateProfile(
    @CurrentUser() userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('me/summary')
  getSummary(@CurrentUser() userId: number) {
    return this.usersService.getSummary(userId);
  }

  @Delete('me')
  deactivate(@CurrentUser() userId: number) {
    return this.usersService.deactivate(userId);
  }
}
