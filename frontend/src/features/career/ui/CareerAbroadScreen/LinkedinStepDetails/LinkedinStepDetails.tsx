import {
  LINKEDIN_RECOMMENDATION_KEYS,
  type CareerAbroadProgress,
} from '@/features/career/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Pressable, Text, TextInput, View } from 'react-native';

interface LinkedinStepDetailsProps {
  progress: CareerAbroadProgress;
  onLinkedinUrlChange: (linkedinUrl: string) => void;
  onOpenLinkedinProfile: () => void;
}

export function LinkedinStepDetails({
  progress,
  onLinkedinUrlChange,
  onOpenLinkedinProfile,
}: LinkedinStepDetailsProps) {
  const { t: tProfile } = useTranslation('profile');
  const hasLinkedinUrl = Boolean(progress.linkedinUrl.trim());

  return (
    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
        {tProfile('careerAbroad.progress.linkedin.description')}
      </Text>
      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        {tProfile('careerAbroad.progress.linkedin.linkLabel')}
      </Text>
      <TextInput
        value={progress.linkedinUrl}
        onChangeText={onLinkedinUrlChange}
        placeholder="https://www.linkedin.com/in/..."
        autoCapitalize="none"
        autoCorrect={false}
        className="mb-4 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        placeholderTextColor="#9CA3AF"
      />
      <Pressable
        onPress={onOpenLinkedinProfile}
        disabled={!hasLinkedinUrl}
        className={`mb-4 self-start rounded-md px-3 py-2 ${
          hasLinkedinUrl
            ? 'bg-indigo-600 active:opacity-70 dark:bg-indigo-400'
            : 'bg-gray-300 dark:bg-gray-700'
        }`}
        accessibilityRole="link"
      >
        <Text
          className={`text-sm font-medium ${
            hasLinkedinUrl
              ? 'text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {tProfile('careerAbroad.progress.linkedin.openLink')}
        </Text>
      </Pressable>
      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        {tProfile('careerAbroad.progress.linkedin.recommendationsTitle')}
      </Text>
      <View className="gap-2">
        {LINKEDIN_RECOMMENDATION_KEYS.map((key) => (
          <View key={key} className="flex-row items-start">
            <Text className="mr-2 text-sm leading-5 text-gray-700 dark:text-gray-200">
              -
            </Text>
            <View className="flex-1">
              <Text className="text-sm leading-5 text-gray-700 dark:text-gray-200">
                {tProfile(
                  `careerAbroad.progress.linkedin.recommendations.${key}.title`
                )}
                :{' '}
                {tProfile(
                  `careerAbroad.progress.linkedin.recommendations.${key}.description`
                )}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
