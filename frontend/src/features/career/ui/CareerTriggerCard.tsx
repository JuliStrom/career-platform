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

export function CareerTriggerCard({
  trigger,
  yearsInCurrentRole,
  onCtaPress,
}: CareerTriggerCardProps) {
  const { t } = useTranslation('career');

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
      {typeof yearsInCurrentRole === 'number' && (
        <Text className="mb-3 text-xs text-gray-600 dark:text-gray-300">
          {t('trigger.yearsInRole', { years: yearsInCurrentRole })}
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
