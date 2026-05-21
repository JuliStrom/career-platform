import type { Job } from '@/features/jobs/model';
import { formatSalary } from '@/features/jobs/utils/job-form.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { IconNavPressable } from '@/shared/ui';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { ReactNode } from 'react';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface JobDetailsViewProps {
  job: Job | null;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  actions?: ReactNode;
}

export function JobDetailsView({
  job,
  error,
  isLoading,
  onBack,
  actions,
}: JobDetailsViewProps) {
  const { t } = useTranslation('jobs');
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#f9fafb';

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!job) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor }}
        edges={['top', 'bottom']}
      >
        <View className="px-4 pt-2">
          <IconNavPressable
            name="arrow-back"
            accessibilityLabel={t('back')}
            onPress={onBack}
          />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-gray-500 dark:text-gray-400">
            {error || t('notFound')}
          </Text>
          <PrimaryButton onPress={onBack} className="mb-0 px-6">
            {t('back')}
          </PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor }}
      edges={['top', 'bottom']}
    >
      <View className="border-b border-gray-200 px-4 pb-2 pt-2 dark:border-gray-700">
        <IconNavPressable
          name="arrow-back"
          accessibilityLabel={t('back')}
          onPress={onBack}
        />
      </View>
      <ScrollView
        className="flex-1 px-4 pb-6 pt-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text className="text-2xl font-semibold text-gray-900 dark:text-white">
          {job.title}
        </Text>
        <Text className="mt-1 text-base text-gray-700 dark:text-gray-300">
          {job.company}
        </Text>
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {job.location} • {job.workFormat}
        </Text>
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {job.level} • {job.direction}
        </Text>

        {job.salary && (
          <Text className="mt-3 text-base font-semibold text-green-700 dark:text-green-400">
            {formatSalary(job.salary, t)}
          </Text>
        )}

        <View className="mt-6">
          <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
            {t('description')}
          </Text>
          <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
            {job.description}
          </Text>
        </View>

        {job.requirements?.length > 0 && (
          <View className="mt-6">
            <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
              {t('requirements')}
            </Text>
            {job.requirements.map((item, index) => (
              <Text
                key={index}
                className="mb-1 text-sm text-gray-700 dark:text-gray-300"
              >
                • {item}
              </Text>
            ))}
          </View>
        )}

        {job.responsibilities?.length > 0 && (
          <View className="mt-6">
            <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
              {t('responsibilities')}
            </Text>
            {job.responsibilities.map((item, index) => (
              <Text
                key={index}
                className="mb-1 text-sm text-gray-700 dark:text-gray-300"
              >
                • {item}
              </Text>
            ))}
          </View>
        )}

        {error && (
          <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
            <Text className="text-sm text-red-700 dark:text-red-300">
              {error}
            </Text>
          </View>
        )}

        {actions ? <View className="mt-8 gap-3">{actions}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
