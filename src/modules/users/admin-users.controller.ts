import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { RolesGuard } from 'src/common/guards/role.guards';
import { CurrentUser } from 'src/common/decorators/auth.decorators';
import { Roles } from 'src/common/guards/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findUserById(+id);
  }

  @Put(':id/role')
  setRole(
    @CurrentUser() adminId: number,
    @Param('id') id: number,
    @Body('role') role: 'USER' | 'ADMIN',
  ) {
    return this.usersService.setRole(adminId, +id, role);
  }
}
