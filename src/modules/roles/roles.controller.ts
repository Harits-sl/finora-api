import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permissions, Roles } from '../../common/decorators';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@Roles('admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('roles:create')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @Permissions('roles:update')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('roles:delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @Permissions('roles:update')
  assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(id, dto);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.OK)
  @Permissions('roles:update')
  revokePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.revokePermission(id, permissionId);
  }

  @Post(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @Permissions('roles:update')
  assignUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.rolesService.assignRoleToUser(id, userId);
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.OK)
  @Permissions('roles:update')
  revokeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.rolesService.revokeRoleFromUser(id, userId);
  }
}
