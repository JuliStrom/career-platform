import {
  fetchCareerRoadmap,
  updateCareerRoadmap,
  type CareerRoadmapPayload,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { CareerRoadmapForm } from '@/features/admin/ui/CareerRoadmapForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function AdminEditCareerRoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<CareerRoadmapPayload>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCareerRoadmap(id)
      .then(({ _id, ...payload }) =>
        setInitialValues({
          ...payload,
          learningResourceIds: payload.learningResourceIds ?? [],
        })
      )
      .catch(() => setError(t('errors.networkError')))
      .finally(() => setLoading(false));
  }, [id, t]);

  async function handleSubmit(payload: CareerRoadmapPayload) {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateCareerRoadmap(id, payload);
      router.replace('/admin/career-roadmaps' as never);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  }

  const navigateToList = () => {
    router.replace('/admin/career-roadmaps' as never);
  };

  if (loading) return <FullScreenLoader />;
  if (!initialValues) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AdminHeader
        title={t('adminCareerRoadmaps.editTitle')}
        onBack={navigateToList}
      />
      <CareerRoadmapForm
        initialValues={initialValues}
        loading={saving}
        error={error}
        onSubmit={handleSubmit}
        onCancel={navigateToList}
      />
    </View>
  );
}
