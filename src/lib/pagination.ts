// src/lib/pagination.ts

export const PAGE_SIZE = 6;

export function parsePage(value: string | undefined) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function totalPagesOf(total: number) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}