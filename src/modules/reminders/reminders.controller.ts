import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CurrentUser } from 'src/common/decorators/auth.decorators';

@Controller('events/:eventId/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(Number(eventId), Number(userId), dto);
  }

  @Get()
  getAll(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.remindersService.getByEvent(Number(eventId), Number(userId));
  }
}
