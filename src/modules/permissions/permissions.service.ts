import { ConflictException, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../common/exceptions/app.exception';
import { successResponse } from '../../common/utils/response.util';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly repo: PermissionsRepository) {}

  async findAll() {
    const permissions = await this.repo.findAll();
    return successResponse(permissions);
  }

  async findById(id: string) {
    const permission = await this.repo.findById(id);
    if (!permission) throw new ResourceNotFoundException('Permission');
    return successResponse(permission);
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.repo.findByName(dto.name);
    if (existing) throw new ConflictException(`Permission '${dto.name}' already exists`);
    const permission = await this.repo.create(dto);
    return successResponse(permission, 'Permission created');
  }

  async remove(id: string) {
    await this.findById(id);
    await this.repo.delete(id);
    return successResponse(null, 'Permission deleted');
  }
}
