import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useJobsStore } from '@/features/jobs/store';
import { JobForm } from '@/features/jobs/ui';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminEditJobScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const updateJob = useJobsStore((state) => state.updateJob);
  const fetchJobById = useJobsStore((state) => state.fetchJobById);
  const selectedJob = useJobsStore((state) => state.selectedJob);
  const isLoading = useJobsStore((state) => state.isLoading);
  const isUpdating = useJobsStore((state) => state.isUpdating);
  const error = useJobsStore((state) => state.error);

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  const handleSubmit = async (payload: Parameters<typeof updateJob>[1]) => {
    if (!id) return;

    try {
      await updateJob(id, payload);
      router.replace(`/admin/jobs/${id}`);
    } catch {
      // Error is handled in store and displayed via error prop
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!id) {
    router.replace('/admin/jobs');
    return null;
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!selectedJob) {
    router.replace('/admin/jobs');
    return null;
  }

  return (
    <>
      <AdminHeader title={t('adminJobsTitle')} />
      <JobForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        error={error}
        initialValues={selectedJob}
        titleKey="editTitle"
      />
    </>
  );
}
