import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { RolesGuard } from 'src/common/guards/role.guards';
import { Roles } from 'src/common/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/events')
export class AdminEventsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.event.findMany({
      include: {
        user: true,
      },
    });
  }

  @Get('stats')
  async stats() {
    const total = await this.prisma.event.count();

    return { total };
  }
}
