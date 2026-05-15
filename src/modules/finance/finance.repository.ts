import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({ skip, take, where, orderBy }),
      this.prisma.transaction.count({ where }),
    ]);
    return { transactions, total };
  }

  async findOne(id: string, userId: string) {
    return this.prisma.transaction.findFirst({ where: { id, userId } });
  }

  async create(data: Prisma.TransactionCreateInput) {
    return this.prisma.transaction.create({ data });
  }

  async update(id: string, data: Prisma.TransactionUpdateInput) {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.transaction.delete({ where: { id } });
  }

  async getSummary(userId: string) {
    return this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });
  }
}
