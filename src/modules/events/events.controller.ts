import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { CurrentUser } from 'src/common/decorators/auth.decorators';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RolesGuard } from 'src/common/guards/role.guards';
import { Roles } from 'src/common/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  create(@CurrentUser() userId: number, @Body() dto: CreateEventDto) {
    return this.eventsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser() userId: number) {
    return this.eventsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@CurrentUser() userId: number, @Param('id') id: number) {
    return this.eventsService.findOne(userId, +id);
  }

  @Put(':id')
  update(
    @CurrentUser() userId: number,
    @Param('id') id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(userId, +id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() userId: number, @Param('id') id: number) {
    return this.eventsService.delete(userId, +id);
  }
}
