import {
  CareerTriggerCard as CareerTriggerCardModel,
  CareerTriggerCta,
} from '../model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Pressable, Text, View } from 'react-native';

interface CareerTriggerCardProps {
  trigger: CareerTriggerCardModel;
  yearsInCurrentRole: number | null;
  onCtaPress: (cta: CareerTriggerCta) => void;
}
//что бы для русского текста были корректные окончания
function getRussianPlural(value: number, forms: [string, string, string]) {
  const abs = Math.abs(value);
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

function formatYearsAndMonths(years: number, language: string) {
  const totalMonths = Math.max(0, Math.round(years * 12));
  const fullYears = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const isRussian = language.toLowerCase().startsWith('ru');

  if (isRussian) {
    const parts: string[] = [];
    if (fullYears > 0) {
      parts.push(
        `${fullYears} ${getRussianPlural(fullYears, ['год', 'года', 'лет'])}`
      );
    }
    if (months > 0 || parts.length === 0) {
      parts.push(
        `${months} ${getRussianPlural(months, [
          'месяц',
          'месяца',
          'месяцев',
        ])}`
      );
    }
    return parts.join(' ');
  }

  const parts: string[] = [];
  if (fullYears > 0) {
    parts.push(`${fullYears} ${fullYears === 1 ? 'year' : 'years'}`);
  }
  if (months > 0 || parts.length === 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }
  return parts.join(' ');
}

export function CareerTriggerCard({
  trigger,
  yearsInCurrentRole,
  onCtaPress,
}: CareerTriggerCardProps) {
  const { t, currentLanguage } = useTranslation('career');
  const formattedRoleDuration =
    typeof yearsInCurrentRole === 'number'
      ? formatYearsAndMonths(yearsInCurrentRole, currentLanguage)
      : null;

  return (
    <View className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
        {t('trigger.badge')}
      </Text>
      <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
        {trigger.triggerTitle}
      </Text>
      <Text className="mb-3 text-sm text-gray-700 dark:text-gray-200">
        {trigger.triggerDescription}
      </Text>
      {formattedRoleDuration && (
        <Text className="mb-3 text-xs text-gray-600 dark:text-gray-300">
          {t('trigger.yearsInRole', { duration: formattedRoleDuration })}
        </Text>
      )}

      <View className="mb-3">
        {trigger.nextSteps.map((step, index) => (
          <View key={`${step.title}-${index}`} className="mb-2">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {index + 1}. {step.title}
            </Text>
            {step.description ? (
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {step.description}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View className="gap-2">
        {trigger.ctaButtons.map((button) => {
          const isPrimary = button.type === trigger.primaryCta;
          return (
            <Pressable
              key={button.type}
              onPress={() => onCtaPress(button.type)}
              className={`rounded-lg px-4 py-3 ${
                isPrimary
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  isPrimary ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {t(`trigger.cta.${button.type}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
