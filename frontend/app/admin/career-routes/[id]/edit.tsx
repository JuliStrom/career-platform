import {
  fetchCareerRoute,
  updateCareerRoute,
  type CareerRoutePayload,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { CareerRouteForm } from '@/features/admin/ui/CareerRouteForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function AdminEditCareerRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<CareerRoutePayload>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCareerRoute(id)
      .then(({ _id, ...payload }) => setInitialValues(payload))
      .catch(() => setError(t('errors.networkError')))
      .finally(() => setLoading(false));
  }, [id, t]);

  async function handleSubmit(payload: CareerRoutePayload) {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateCareerRoute(id, payload);
      router.replace('/admin/career-routes' as never);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <FullScreenLoader />;
  if (!initialValues)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{error}</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AdminHeader title={t('adminRoutes.editTitle')} />
      <CareerRouteForm
        initialValues={initialValues}
        loading={saving}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}
