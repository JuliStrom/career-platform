import {
  createCareerRoadmap,
  type CareerRoadmapPayload,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { CareerRoadmapForm } from '@/features/admin/ui/CareerRoadmapForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function AdminCreateCareerRoadmapScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: CareerRoadmapPayload) {
    setLoading(true);
    setError(null);
    try {
      await createCareerRoadmap(payload);
      router.replace('/admin/career-roadmaps' as never);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  const navigateToList = () => {
    router.replace('/admin/career-roadmaps' as never);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AdminHeader
        title={t('adminCareerRoadmaps.createTitle')}
        onBack={navigateToList}
      />
      <CareerRoadmapForm
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={navigateToList}
      />
    </View>
  );
}
