import {
  createCareerRoute,
  type CareerRoutePayload,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { CareerRouteForm } from '@/features/admin/ui/CareerRouteForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function AdminCreateCareerRouteScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: CareerRoutePayload) {
    setLoading(true);
    setError(null);
    try {
      await createCareerRoute(payload);
      router.replace('/admin/career-routes' as never);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AdminHeader title={t('adminRoutes.createTitle')} />
      <CareerRouteForm
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}
