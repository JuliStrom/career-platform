import type {
  NotificationPayload,
  NotificationType,
} from '@/features/notifications/model';

function getRussianPlural(
  value: number,
  one: string,
  few: string,
  many: string
) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }
  return many;
}

export function formatYearsAndMonths(years: number, language: string): string {
  const totalMonths = Math.max(0, Math.round(years * 12));
  const fullYears = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const isRussian = language.startsWith('ru');
  const parts: string[] = [];

  if (fullYears > 0) {
    const unit = isRussian
      ? getRussianPlural(fullYears, 'год', 'года', 'лет')
      : fullYears === 1
        ? 'year'
        : 'years';
    parts.push(`${fullYears} ${unit}`);
  }

  if (months > 0 || fullYears === 0) {
    const unit = isRussian
      ? getRussianPlural(months, 'месяц', 'месяца', 'месяцев')
      : months === 1
        ? 'month'
        : 'months';
    parts.push(`${months} ${unit}`);
  }

  return parts.join(' ');
}

export function formatNotificationPayload(
  type: NotificationType,
  payload: NotificationPayload,
  language: string
): Record<string, unknown> {
  if (type !== 'growth_trigger' || typeof payload.years !== 'number') {
    return payload;
  }

  return {
    ...payload,
    duration: formatYearsAndMonths(payload.years, language),
  };
}
