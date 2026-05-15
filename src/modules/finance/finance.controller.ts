import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FinanceService } from './finance.service';

interface AuthUser {
  id: string;
  email: string;
}

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.financeService.findAll(user.id, paginationDto);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: AuthUser) {
    return this.financeService.getSummary(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.financeService.findById(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTransactionDto) {
    return this.financeService.create(user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.financeService.remove(id, user.id);
  }
}
