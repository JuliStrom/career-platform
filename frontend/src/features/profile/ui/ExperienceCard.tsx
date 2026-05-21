import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';

interface ExperienceCardProps {
  experience: string;
}

export const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const { t } = useTranslation('profile');

  return (
    <>
      <Text className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {t('experience')}
      </Text>
      <View
        className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        accessibilityLabel={`${t('accessibility.experienceLabel')}: ${experience}`}
      >
        <Text className="text-base leading-6 text-gray-900 dark:text-white">
          {experience}
        </Text>
      </View>
    </>
  );
};
