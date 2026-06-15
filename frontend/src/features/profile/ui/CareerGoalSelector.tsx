import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';
import { CareerGoal } from '../model';

interface CareerGoalSelectorProps {
  careerGoal: CareerGoal;
}

export const CareerGoalSelector = ({ careerGoal }: CareerGoalSelectorProps) => {
  const { t } = useTranslation('profile');
  const goalText = t(`careerGoals.${careerGoal}`) || careerGoal;

  return (
    <View className="mb-6">
      <Text className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {t('careerGoal')}
      </Text>
      <View className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/30">
        <Text
          className="text-base font-semibold text-green-800 dark:text-green-200"
          accessibilityLabel={`${t('accessibility.careerGoalLabel')}: ${goalText}`}
        >
          {goalText}
        </Text>
      </View>
    </View>
  );
};
