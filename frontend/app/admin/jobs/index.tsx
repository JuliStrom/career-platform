import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useJobsStore } from '@/features/jobs/store';
import { JobsListView } from '@/features/jobs/ui/JobsListView';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function AdminJobsListScreen() {
  const {
    jobs,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    fetchJobs,
  } = useJobsStore();
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  function handleOpenJob(id: string) {
    router.push(`/admin/jobs/${id}`);
  }

  function handleApplyFilters() {
    fetchJobs();
  }

  function handleResetFilters() {
    resetFilters();
    fetchJobs();
  }

  const { t } = useTranslation('common');

  return (
    <View className="flex-1">
      <AdminHeader title={t('adminJobsTitle')} />
      <JobsListView
        jobs={jobs}
        total={total}
        isLoading={isLoading}
        error={error}
        filters={filters}
        onChangeFilters={setFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        onOpenJob={handleOpenJob}
        headerRight={
          <PrimaryButton
            onPress={() => router.push('/admin/jobs/create')}
            className="px-4 py-2"
          >
            Создать
          </PrimaryButton>
        }
      />
    </View>
  );
}
