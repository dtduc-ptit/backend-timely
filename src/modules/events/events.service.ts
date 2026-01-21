import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateEventDto) {
    const startDate = new Date(dto.startDate);

    return this.prisma.event.create({
      data: {
        title: dto.title,
        startDate,
        note: dto.note,
        userId,

        reminders: dto.reminderDays?.length
          ? {
              create: dto.reminderDays.map((daysBefore) => {
                const remindAt = new Date(startDate);

                remindAt.setDate(remindAt.getDate() - daysBefore);

                // Set giờ 09:00
                remindAt.setHours(9, 0, 0, 0);

                return {
                  remindAt,
                  channel: 'IN_APP',
                  status: 'PENDING',
                  isActive: true,
                };
              }),
            }
          : undefined,
      },
      include: {
        reminders: true,
      },
    });
  }

  async findAllByUser(userId: number) {
    const events = await this.prisma.event.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
    });

    return events.map((e) => ({
      ...e,
      daysPassed: this.calcDaysPassed(e.startDate),
      daysToNext: this.calcDaysToNext(e.startDate),
    }));
  }

  async findOne(userId: number, eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        reminders: true,
      },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException();
    }

    return {
      ...event,
      daysPassed: this.calcDaysPassed(event.startDate),
      daysToNext: this.calcDaysToNext(event.startDate),
    };
  }

  async update(userId: number, eventId: number, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        note: dto.note,
      },
    });
  }

  async delete(userId: number, eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  // =====================
  // BUSINESS LOGIC
  // =====================

  private calcDaysPassed(startDate: Date): number {
    const now = new Date();
    return Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private calcDaysToNext(startDate: Date): number {
    const now = new Date();
    const next = new Date(startDate);
    next.setFullYear(now.getFullYear());
    if (next < now) next.setFullYear(now.getFullYear() + 1);

    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
