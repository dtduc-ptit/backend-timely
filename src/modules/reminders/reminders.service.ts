import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, userId: string, dto: CreateReminderDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException('Event not found');
    }

    return this.prisma.reminder.create({
      data: {
        eventId,
        remindAt: new Date(dto.remindAt),
        channel: dto.channel,
      },
    });
  }

  async getByEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { reminders: true },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException();
    }

    return event.reminders;
  }

  async markAsSent(reminderId: string) {
    return this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }
}
