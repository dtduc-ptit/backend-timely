import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        startDate: new Date(dto.startDate),
        note: dto.note,
        userId,
        targetId: dto.targetId,
        categoryId: dto.categoryId,
        reminders: dto.reminderDays
          ? {
              create: dto.reminderDays.map((d) => ({
                daysBefore: d,
                time: '09:00',
              })),
            }
          : undefined,
      },
      include: {
        target: true,
        category: true,
        reminders: true,
      },
    });
  }

  async findAllByUser(userId: number) {
    const events = await this.prisma.event.findMany({
      where: { userId },
      include: {
        target: true,
        category: true,
      },
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
        target: true,
        category: true,
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
        categoryId: dto.categoryId,
        targetId: dto.targetId,
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
