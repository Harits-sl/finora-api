export const API_PREFIX = 'api/v1';

export const JWT_STRATEGY = 'jwt';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  SHOPPING = 'SHOPPING',
  BILLS = 'BILLS',
  SALARY = 'SALARY',
  INVESTMENT = 'INVESTMENT',
  OTHER = 'OTHER',
}
