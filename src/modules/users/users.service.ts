import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ======================
  // USER SIDE
  // ======================

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: number, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });
  }

  async getSummary(userId: number) {
    const events = await this.prisma.event.findMany({
      where: { userId },
      select: {
        title: true,
        startDate: true,
      },
    });

    const now = new Date();

    const mapped = events.map((e) => {
      const next = new Date(e.startDate);
      next.setFullYear(now.getFullYear());
      if (next < now) next.setFullYear(now.getFullYear() + 1);

      const daysToNext = Math.ceil(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        title: e.title,
        daysToNext,
      };
    });

    const nearest = mapped.sort((a, b) => a.daysToNext - b.daysToNext)[0];

    return {
      totalEvents: events.length,
      upcomingEvents: mapped.filter((e) => e.daysToNext <= 30).length,
      nearestEvent: nearest,
    };
  }

  async deactivate(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.local`,
      },
    });
  }

  // ======================
  // ADMIN SIDE
  // ======================

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { events: true },
        },
      },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        events: true,
      },
    });
  }

  async setRole(adminId: number, userId: number, role: 'USER' | 'ADMIN') {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (admin?.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
