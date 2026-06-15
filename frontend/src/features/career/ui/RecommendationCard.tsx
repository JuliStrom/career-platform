import { Recommendation } from '../model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Pressable, Text, View } from 'react-native';
import { RecommendationActionItem } from './RecommendationActionItem';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress?: () => void;
}

export function RecommendationCard({
  recommendation,
  onPress,
}: RecommendationCardProps) {
  const { t } = useTranslation('career');
  const directionText =
    t(`directions.${recommendation.direction}`) || recommendation.direction;
  const levelText = t(`levels.${recommendation.level}`) || recommendation.level;

  const content = (
    <>
      <View className="mb-3 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900">
          <Text className="text-xs font-semibold text-blue-800 dark:text-blue-200">
            {directionText}
          </Text>
        </View>
        <View className="rounded-full bg-purple-100 px-3 py-1.5 dark:bg-purple-900">
          <Text className="text-xs font-semibold text-purple-800 dark:text-purple-200">
            {levelText}
          </Text>
        </View>
      </View>

      <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {recommendation.title}
      </Text>

      <Text className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {recommendation.description}
      </Text>

      {recommendation.actions.length > 0 && (
        <View className="mt-2">
          <Text className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('form.actions')}
          </Text>
          {recommendation.actions.map((action, index) => (
            <RecommendationActionItem key={index} action={action} />
          ))}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="mb-4 rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50 active:opacity-95 dark:bg-gray-800 dark:hover:bg-gray-700/50"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      {content}
    </View>
  );
}
