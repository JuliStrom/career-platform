import type { CompanySummary } from '@/features/career/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Text, View } from 'react-native';

interface CompaniesStepDetailsProps {
  companySummaries: CompanySummary[];
  isStatsLoading: boolean;
  targetCountryMarketName: string;
}

export function CompaniesStepDetails({
  companySummaries,
  isStatsLoading,
  targetCountryMarketName,
}: CompaniesStepDetailsProps) {
  const { t: tProfile } = useTranslation('profile');

  return (
    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
        {tProfile('careerAbroad.progress.companies.description', {
          targetCountry: targetCountryMarketName,
        })}
      </Text>
      <View className="gap-2">
        {companySummaries.map((company) => (
          <View
            key={company.name}
            className="rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">
              {company.name}
            </Text>
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {tProfile('careerAbroad.progress.companies.vacanciesCount', {
                count: company.vacanciesCount,
              })}
            </Text>
            {company.locations.length > 0 && (
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {company.locations.join(', ')}
              </Text>
            )}
          </View>
        ))}
        {!isStatsLoading && companySummaries.length === 0 && (
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {tProfile('careerAbroad.progress.companies.empty')}
          </Text>
        )}
        {isStatsLoading && (
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {tProfile('careerAbroad.progress.companies.loading')}
          </Text>
        )}
      </View>
    </View>
  );
}
