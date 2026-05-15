import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ResourceNotFoundException } from '../../common/exceptions/app.exception';
import { successResponse } from '../../common/utils/response.util';
import { PermissionsRepository } from '../permissions/permissions.repository';
import { UsersRepository } from '../users/users.repository';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly repo: RolesRepository,
    private readonly permissionsRepo: PermissionsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async findAll() {
    const roles = await this.repo.findAll();
    return successResponse(roles);
  }

  async findById(id: string) {
    const role = await this.repo.findById(id);
    if (!role) throw new ResourceNotFoundException('Role');
    return successResponse(role);
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.repo.findByName(dto.name);
    if (existing) throw new ConflictException(`Role '${dto.name}' already exists`);
    const role = await this.repo.create(dto);
    return successResponse(role, 'Role created');
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findById(id);
    if (dto.name) {
      const existing = await this.repo.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role '${dto.name}' already exists`);
      }
    }
    const role = await this.repo.update(id, dto);
    return successResponse(role, 'Role updated');
  }

  async remove(id: string) {
    await this.findById(id);
    await this.repo.delete(id);
    return successResponse(null, 'Role deleted');
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    const role = await this.repo.findById(id);
    if (!role) throw new ResourceNotFoundException('Role');

    for (const permissionId of dto.permissionIds) {
      const permission = await this.permissionsRepo.findById(permissionId);
      if (!permission) {
        throw new NotFoundException(`Permission '${permissionId}' not found`);
      }
      await this.repo.assignPermission(id, permissionId);
    }

    const updated = await this.repo.findById(id);
    return successResponse(updated, 'Permissions assigned');
  }

  async revokePermission(roleId: string, permissionId: string) {
    const role = await this.repo.findById(roleId);
    if (!role) throw new ResourceNotFoundException('Role');
    await this.repo.revokePermission(roleId, permissionId);
    return successResponse(null, 'Permission revoked');
  }

  async assignRoleToUser(roleId: string, userId: string) {
    const role = await this.repo.findById(roleId);
    if (!role) throw new ResourceNotFoundException('Role');
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new ResourceNotFoundException('User');
    await this.usersRepo.assignRole(userId, roleId);
    return successResponse(null, 'Role assigned to user');
  }

  async revokeRoleFromUser(roleId: string, userId: string) {
    const role = await this.repo.findById(roleId);
    if (!role) throw new ResourceNotFoundException('Role');
    await this.usersRepo.revokeRole(userId, roleId);
    return successResponse(null, 'Role revoked from user');
  }
}
