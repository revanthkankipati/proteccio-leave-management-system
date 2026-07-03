import { PaginationParams } from '../types';

export function getPaginationParams(page: number, limit: number): PaginationParams {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}
