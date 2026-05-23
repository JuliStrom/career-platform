import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';

interface RouteSummaryCardProps {
  level: string;
  direction: string;
  originCountry: string;
  targetCountry: string;
}

export function RouteSummaryCard({
  level,
  direction,
  originCountry,
  targetCountry,
}: RouteSummaryCardProps) {
  const { t: tProfile } = useTranslation('profile');

  return (
    <View className="mb-8 rounded-lg border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-800">
      <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {tProfile('careerAbroad.selectedRoute')}
      </Text>
      <Text className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
        {level} {direction} {tProfile('careerAbroad.routeFrom')}{' '}
        <Text className="rounded-md bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          {originCountry}
        </Text>{' '}
        - {tProfile('careerAbroad.routeWorkIn')}{' '}
        <Text className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          {targetCountry}
        </Text>
      </Text>
    </View>
  );
}
