import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';
import { Direction, Level } from '../model';

interface DirectionLevelBadgeProps {
  direction: Direction;
  level: Level;
}

export const DirectionLevelBadge = ({
  direction,
  level,
}: DirectionLevelBadgeProps) => {
  const { t } = useTranslation('profile');
  const directionText = t(`directions.${direction}`) || direction;
  const levelText = t(`levels.${level}`) || level;

  return (
    <View className="mb-6 flex-row gap-2">
      <View
        className="rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900"
        accessibilityLabel={`${t('accessibility.directionLabel')}: ${directionText}`}
      >
        <Text
          className="text-sm font-semibold text-blue-800 dark:text-blue-200"
          accessibilityLabel={`${t('accessibility.directionLabel')}: ${directionText}`}
        >
          {directionText}
        </Text>
      </View>
      <View
        className="rounded-full bg-purple-100 px-3 py-1.5 dark:bg-purple-900"
        accessibilityLabel={`${t('accessibility.levelLabel')}: ${levelText}`}
      >
        <Text
          className="text-sm font-semibold text-purple-800 dark:text-purple-200"
          accessibilityLabel={`${t('accessibility.levelLabel')}: ${levelText}`}
        >
          {levelText}
        </Text>
      </View>
    </View>
  );
};
