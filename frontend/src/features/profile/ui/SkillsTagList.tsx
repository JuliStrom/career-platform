import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { ScrollView, Text, View } from 'react-native';

interface SkillsTagListProps {
  skills: string[];
}

export const SkillsTagList = ({ skills }: SkillsTagListProps) => {
  const { t } = useTranslation('profile');

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {t('skills')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        accessibilityLabel={t('accessibility.skillsList')}
      >
        <View className="flex-row flex-wrap gap-2">
          {skills.map((skill, index) => (
            <View
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
            >
              <Text
                className="text-sm text-gray-700 dark:text-gray-300"
                accessibilityLabel={t('accessibility.skillTag', { skill })}
              >
                {skill}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
