import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEmployerStore } from '@/features/employer/store/employer-store';
import type { Job } from '@/features/jobs/model';
import {
  formatJobTitle,
  formatSalary,
} from '@/features/jobs/utils/job-form.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { UserType } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { type Href, Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmployerJobsScreen() {
  const { t } = useTranslation('employer');
  const { t: tJobs } = useTranslation('jobs');
  const userType = useAuthStore((state) => state.user?.userType);
  const company = useEmployerStore((state) => state.company);
  const companyHydrated = useEmployerStore((state) => state.companyHydrated);
  const ownJobs = useEmployerStore((state) => state.ownJobs);
  const ownJobsTotal = useEmployerStore((state) => state.ownJobsTotal);
  const isLoading = useEmployerStore((state) => state.isLoadingOwnJobs);
  const error = useEmployerStore((state) => state.error);
  const fetchCompany = useEmployerStore((state) => state.fetchCompany);
  const fetchOwnJobs = useEmployerStore((state) => state.fetchOwnJobs);

  useEffect(() => {
    if (!companyHydrated) {
      void fetchCompany();
    }
  }, [companyHydrated, fetchCompany]);

  useEffect(() => {
    if (companyHydrated && company) {
      void fetchOwnJobs();
    }
  }, [company, companyHydrated, fetchOwnJobs]);

  if (!userType) return <Redirect href="/choose-path" />;
  if (userType !== UserType.EMPLOYER) return <Redirect href="/jobs" />;

  function renderJob({ item }: { item: Job }) {
    return (
      <Pressable
        onPress={() => router.push(`/employer/jobs/${item._id}` as Href)}
        className="mb-3 rounded-xl bg-white p-4 shadow-sm active:opacity-90 dark:bg-gray-800"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {formatJobTitle(item.title, tJobs)}
            </Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {item.location} • {tJobs(`workFormats.${item.workFormat}`)}
            </Text>
            {item.salary ? (
              <Text className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
                {formatSalary(item.salary, tJobs)}
              </Text>
            ) : null}
          </View>
          <View
            className={`rounded-full px-2.5 py-1 ${
              item.isActive
                ? 'bg-green-100 dark:bg-green-900/40'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.isActive
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {item.isActive ? t('jobs.active') : t('jobs.inactive')}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <FlatList
        data={ownJobs}
        keyExtractor={(item) => item._id}
        renderItem={renderJob}
        refreshing={isLoading}
        onRefresh={() => void fetchOwnJobs()}
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <Text className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
              {t('jobs.title')}
            </Text>
            <Text className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {t('jobs.total', { count: ownJobsTotal })}
            </Text>
            {!company ? (
              <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                <Text className="mb-3 text-sm text-amber-900 dark:text-amber-100">
                  {t('jobs.companyRequired')}
                </Text>
                <PrimaryButton
                  onPress={() => router.push('/employer/profile')}
                  className="mb-0"
                >
                  {t('profile.create')}
                </PrimaryButton>
              </View>
            ) : (
              <PrimaryButton
                onPress={() => router.push('/employer/jobs/create' as Href)}
              >
                {t('jobs.create')}
              </PrimaryButton>
            )}
            {error ? (
              <Text className="mb-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text className="mt-8 text-center text-gray-500 dark:text-gray-400">
              {t('jobs.empty')}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
