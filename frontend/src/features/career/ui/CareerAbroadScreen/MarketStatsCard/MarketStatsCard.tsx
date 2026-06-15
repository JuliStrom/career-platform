import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';

interface MarketStatsCardProps {
  vacanciesValue: number | string;
  level: string;
  direction: string;
  targetCountryMarketName: string;
  salaryRange: string;
  statsError: string | null;
}

export function MarketStatsCard({
  vacanciesValue,
  level,
  direction,
  targetCountryMarketName,
  salaryRange,
  statsError,
}: MarketStatsCardProps) {
  const { t: tProfile } = useTranslation('profile');

  return (
    <View className="mb-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
      <Text className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-200">
        {tProfile('careerAbroad.marketStats')}
      </Text>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white">
        {tProfile('careerAbroad.vacanciesNow', {
          count: vacanciesValue,
          level,
          direction,
          targetCountry: targetCountryMarketName,
        })}
      </Text>
      <Text className="mt-3 text-base text-gray-700 dark:text-gray-200">
        {tProfile('careerAbroad.averageSalary', {
          salaryRange,
        })}
      </Text>
      {statsError && (
        <Text className="mt-3 text-sm text-red-600 dark:text-red-300">
          {statsError}
        </Text>
      )}
    </View>
  );
}
