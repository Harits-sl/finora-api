import { TransactionCategory, TransactionType } from '../../../common/constants';

export class TransactionEntity {
  id!: string;
  userId!: string;
  type!: TransactionType;
  category!: TransactionCategory;
  amount!: number;
  description!: string | null;
  date!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<TransactionEntity>) {
    Object.assign(this, partial);
  }
}
