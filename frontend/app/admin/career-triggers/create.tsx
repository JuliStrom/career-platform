import {
  createCareerTrigger,
  type CareerTriggerPayload,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { CareerTriggerForm } from '@/features/admin/ui/CareerTriggerForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function AdminCreateCareerTriggerScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: CareerTriggerPayload) {
    setLoading(true);
    setError(null);
    try {
      await createCareerTrigger(payload);
      router.replace('/admin/career-triggers' as never);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  const navigateToList = () => {
    router.replace('/admin/career-triggers' as never);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AdminHeader
        title={t('adminCareerTriggers.createTitle')}
        onBack={navigateToList}
      />
      <CareerTriggerForm
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={navigateToList}
      />
    </View>
  );
}
