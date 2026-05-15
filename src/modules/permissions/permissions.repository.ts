import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.permission.findUnique({ where: { name } });
  }

  async create(data: Prisma.PermissionCreateInput) {
    return this.prisma.permission.create({ data });
  }

  async delete(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
