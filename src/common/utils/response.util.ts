import {
  ApiErrorResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types/response.type';

export function successResponse<T>(
  data: T,
  message = 'Success',
): ApiResponse<T> {
  return { success: true, message, data };
}

export function errorResponse(
  message: string,
  errors?: unknown[],
): ApiErrorResponse {
  return { success: false, message, errors };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
): PaginatedResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
