import { useProfileStore } from '@/features/profile/store/profile-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CareerAbroadScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const { t: tProfile } = useTranslation('profile');
  const emptyValue = '—';

  const level = profile?.level
    ? tProfile(`levels.${profile.level}`)
    : emptyValue;
  const direction = profile?.direction
    ? tProfile(`directions.${profile.direction}`)
    : emptyValue;
  const city = profile?.city ? tProfile(`cities.${profile.city}`) : emptyValue;
  const targetCountry = profile?.relocationToCountry
    ? tProfile(`relocationCountries.${profile.relocationToCountry}`)
    : tProfile('relocationCountries.dubai');
  const routeTitle = tProfile('careerAbroad.routeTitle', {
    level,
    direction,
    city,
    targetCountry,
  });

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
          {tProfile('careerAbroad.title')}
        </Text>
        <Text className="mb-8 text-base text-gray-600 dark:text-gray-300">
          {tProfile('careerAbroad.description')}
        </Text>
        <View className="mb-8 rounded-lg border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-800">
          <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {tProfile('careerAbroad.selectedRoute')}
          </Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {routeTitle}
          </Text>
        </View>
        <PrimaryButton
          onPress={() => router.back()}
          accessibilityLabel={tProfile('careerAbroad.backButton')}
        >
          {tProfile('careerAbroad.backButton')}
        </PrimaryButton>
      </View>
    </SafeAreaView>
  );
}
