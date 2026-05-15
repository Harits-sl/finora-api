import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ResourceNotFoundException } from '../../common/exceptions/app.exception';
import {
  paginatedResponse,
  successResponse,
} from '../../common/utils/response.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinanceRepository } from './finance.repository';

@Injectable()
export class FinanceService {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const { transactions, total } = await this.financeRepository.findAll({
      skip,
      take: limit,
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return paginatedResponse(transactions, total, page, limit);
  }

  async findById(id: string, userId: string) {
    const transaction = await this.financeRepository.findOne(id, userId);
    if (!transaction) throw new ResourceNotFoundException('Transaction');
    return successResponse(transaction);
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const transaction = await this.financeRepository.create({
      type: dto.type,
      category: dto.category,
      amount: dto.amount,
      description: dto.description,
      date: new Date(dto.date),
      user: { connect: { id: userId } },
    });
    return successResponse(transaction, 'Transaction created successfully');
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    await this.findById(id, userId);
    const updated = await this.financeRepository.update(id, {
      ...dto,
      ...(dto.date && { date: new Date(dto.date) }),
    });
    return successResponse(updated, 'Transaction updated successfully');
  }

  async remove(id: string, userId: string) {
    await this.findById(id, userId);
    await this.financeRepository.delete(id);
    return successResponse(null, 'Transaction deleted successfully');
  }

  async getSummary(userId: string) {
    const rows = await this.financeRepository.getSummary(userId);

    const result = { income: 0, expense: 0, balance: 0 };
    for (const row of rows) {
      const amount = Number(row._sum.amount ?? 0);
      if (row.type === 'INCOME') result.income = amount;
      if (row.type === 'EXPENSE') result.expense = amount;
    }
    result.balance = result.income - result.expense;

    return successResponse(result, 'Summary retrieved successfully');
  }
}
