import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useJobsStore } from '@/features/jobs/store';
import { JobForm } from '@/features/jobs/ui';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function AdminCreateJobScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const createJob = useJobsStore((state) => state.createJob);
  const isLoading = useJobsStore((state) => state.isLoading);
  const error = useJobsStore((state) => state.error);

  const handleSubmit = async (payload: Parameters<typeof createJob>[0]) => {
    try {
      await createJob(payload);
      router.replace('/admin/jobs');
    } catch {
      // Error is handled in store and displayed via error prop
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1">
      <AdminHeader title={t('adminJobsTitle')} />
      <JobForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={error}
      />
    </View>
  );
}
