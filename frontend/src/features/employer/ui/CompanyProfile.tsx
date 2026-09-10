import type { Company } from '@/features/employer/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useState, type ReactNode } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

interface CompanyProfileProps {
  company: Company;
  onEdit: () => void;
  footer?: ReactNode;
}

export function CompanyProfile({
  company,
  onEdit,
  footer,
}: CompanyProfileProps) {
  const { t } = useTranslation('employer');
  const { t: tJobs } = useTranslation('jobs');
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const details = [
    {
      label: t('company.workFormat'),
      value: tJobs(`workFormats.${company.workFormat}`),
    },
    {
      label: t('company.teamSize'),
      value: tJobs(`teamSizes.${company.teamSize}`),
    },
    {
      label: t('company.growthSpeed'),
      value: tJobs(`growthSpeeds.${company.growthSpeed}`),
    },
    {
      label: t('company.languages'),
      value: company.languages
        .map((language) => t(`company.languageValues.${language}`))
        .join(', '),
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
    >
      <View className="w-full max-w-3xl self-center">
        <View className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <View className="p-6">
            <Text className="mb-4 text-sm font-medium text-blue-600 dark:text-blue-300">
              {t('profile.title')}
            </Text>
            <View className="flex-row items-center gap-4">
              <View
                style={{ width: 124.8, height: 124.8 }}
                className="shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-50 dark:border-gray-800 dark:bg-gray-700"
              >
                {company.logo && failedLogo !== company.logo ? (
                  <Image
                    source={{ uri: company.logo }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                    accessibilityLabel={company.name}
                    onError={() => setFailedLogo(company.logo ?? null)}
                  />
                ) : (
                  <Text className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {company.name.trim().slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text
                accessibilityRole="header"
                className="min-w-0 flex-1 text-3xl font-bold text-gray-900 dark:text-white"
              >
                {company.name}
              </Text>
            </View>
            <View className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
              <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('company.description')}
              </Text>
              <Text className="text-base leading-7 text-gray-700 dark:text-gray-200">
                {company.description}
              </Text>
            </View>
            <View className="mt-6 flex-row flex-wrap gap-3">
              {details.map(({ label, value }) => (
                <View
                  key={label}
                  className="min-w-[140px] flex-1 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900"
                >
                  <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {label}
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
            {company.valuesTags.length > 0 && (
              <View className="mt-6">
                <Text className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('company.valuesTags')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {company.valuesTags.map((tag, index) => (
                    <View
                      key={`${tag}-${index}`}
                      className="rounded-full bg-blue-50 px-4 py-2 dark:bg-blue-950"
                    >
                      <Text className="text-sm font-medium text-blue-700 dark:text-blue-200">
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
        <PrimaryButton
          onPress={onEdit}
          className="mb-0 mt-6"
          accessibilityLabel={t('company.edit')}
        >
          Edit
        </PrimaryButton>
        {footer}
      </View>
    </ScrollView>
  );
}
