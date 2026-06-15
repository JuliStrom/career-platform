import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useJobsStore } from '@/features/jobs/store';
import { JobDetailsView } from '@/features/jobs/ui/JobDetailsView';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

export default function AdminJobDetailsScreen() {
  const { t } = useTranslation('jobs');
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    selectedJob,
    isLoading,
    isDeleting,
    error,
    fetchJobById,
    resetSelectedJob,
    deleteJob,
  } = useJobsStore();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }

    return () => {
      resetSelectedJob();
    };
  }, [id, fetchJobById, resetSelectedJob]);

  async function performDelete() {
    if (!id) return;
    try {
      await deleteJob(id);
      router.replace('/admin/jobs');
    } catch {
      // error already shown in store
    }
  }

  function handleDelete() {
    if (!id) return;
    if (Platform.OS === 'web') {
      if (window.confirm(`${t('deleteAlertTitle')}: ${t('deleteConfirm')}?`)) {
        performDelete();
      }
      return;
    }
    Alert.alert(t('deleteAlertTitle'), t('deleteConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => performDelete(),
      },
    ]);
  }

  const { t: tCommon } = useTranslation('common');

  return (
    <>
      <AdminHeader title={tCommon('adminJobsTitle')} />
      <JobDetailsView
        job={selectedJob}
        error={error}
        isLoading={isLoading || !id}
        onBack={() => router.replace('/admin/jobs')}
        actions={
          <>
            <PrimaryButton
              onPress={() => router.push(`/admin/jobs/${id}/edit`)}
            >
              {t('edit')}
            </PrimaryButton>
            <PrimaryButton
              onPress={handleDelete}
              disabled={isDeleting}
              isLoading={isDeleting}
              className="bg-red-600 dark:bg-red-600"
            >
              {t('delete')}
            </PrimaryButton>
          </>
        }
      />
    </>
  );
}
