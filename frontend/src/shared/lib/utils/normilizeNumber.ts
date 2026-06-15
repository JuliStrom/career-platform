export function normalizeNumberInput(value: string): string {
  return value.replace(/\D/g, '');
}
