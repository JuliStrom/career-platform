export function parseListInput(value: string): string[] {
  return value
    .split(/[,،،\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatListInput(items: string[]): string {
  return items.join(', ');
}
