import { Direction } from '@/shared/model';

export const MAX_PROFILE_DIRECTIONS = 3;

const allowedDirections = new Set<string>(Object.values(Direction));

export function normalizeProfileDirections(
  direction: unknown
): Direction[] {
  const source = Array.isArray(direction)
    ? direction
    : direction
      ? [direction]
      : [];
  const unique: Direction[] = [];

  for (const item of source) {
    if (typeof item !== 'string' || !allowedDirections.has(item)) continue;
    if (unique.includes(item as Direction)) continue;
    unique.push(item as Direction);
    if (unique.length >= MAX_PROFILE_DIRECTIONS) break;
  }

  return unique;
}

export function primaryProfileDirection(
  direction: unknown
): Direction | undefined {
  return normalizeProfileDirections(direction)[0];
}

export function toggleProfileDirection(
  current: Direction[],
  selected: Direction
): Direction[] {
  if (current.includes(selected)) {
    return current.length === 1
      ? current
      : current.filter((item) => item !== selected);
  }
  if (current.length >= MAX_PROFILE_DIRECTIONS) return current;
  return [...current, selected];
}
