import type { Request } from "express";

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (req: Request): Pagination => {
  const rawPage = Number(req.query.page);
  const rawLimit = Number(req.query.limit);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const paginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});
