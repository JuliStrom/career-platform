import { Direction } from '../types';

export const MAX_PROFILE_DIRECTIONS = 3;

const allowedDirections = new Set<string>(Object.values(Direction));

function collectDirectionValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  return [value];
}

export function normalizeProfileDirections(input: {
  direction?: unknown;
  directions?: unknown;
}): Direction[] {
  const listed = collectDirectionValues(input.directions);
  const source = listed.length > 0 ? listed : collectDirectionValues(input.direction);
  const unique: Direction[] = [];

  for (const item of source) {
    if (typeof item !== 'string' || !allowedDirections.has(item)) continue;
    if (unique.includes(item as Direction)) continue;
    unique.push(item as Direction);
    if (unique.length >= MAX_PROFILE_DIRECTIONS) break;
  }

  return unique;
}
