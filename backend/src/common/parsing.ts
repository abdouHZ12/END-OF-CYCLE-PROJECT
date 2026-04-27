import { httpError } from './errors.js';

export function toInt(value: unknown, name: string): number {
  const n = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : Number.NaN;

  if (!Number.isFinite(n)) {
    throw httpError(400, `${name} is required`);
  }

  return n;
}
