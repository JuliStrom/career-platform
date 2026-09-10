/**
 * Приглушённая холодная палитра для фонов и хедера.
 * Те же значения продублированы в tailwind.config.js под именами
 * canvas / header / hairline — правь оба места вместе.
 */
export const surfaceColors = {
  canvas: { light: '#f4f6fb', dark: '#0f1729' },
  header: { light: '#dfe7f5', dark: '#182242' },
  hairline: { light: '#c8d5ec', dark: '#283454' },
} as const;

type Surface = keyof typeof surfaceColors;

export function surfaceColor(
  surface: Surface,
  colorScheme: 'light' | 'dark' | null | undefined
): string {
  return surfaceColors[surface][colorScheme === 'dark' ? 'dark' : 'light'];
}
