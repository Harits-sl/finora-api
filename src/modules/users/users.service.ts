import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ResourceNotFoundException } from '../../common/exceptions/app.exception';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/response.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const { users, total } = await this.usersRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    const safeUsers = users.map(({ password: _, ...u }) => u);
    return paginatedResponse(safeUsers, total, page, limit);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new ResourceNotFoundException('User');
    const { password: _, ...safe } = user;
    return safe;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(data: Prisma.UserCreateInput) {
    return this.usersRepository.create(data);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    const updated = await this.usersRepository.update(id, dto);
    const { password: _, ...safe } = updated;
    return successResponse(safe, 'User updated successfully');
  }

  async remove(id: string) {
    await this.findById(id);
    await this.usersRepository.delete(id);
    return successResponse(null, 'User deleted successfully');
  }
}
