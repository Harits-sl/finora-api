import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Permissions, Roles } from '../../common/decorators';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('permissions:create')
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('permissions:delete')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
