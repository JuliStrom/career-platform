import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useCareerStore } from '@/features/career/store';
import { CareerScenarioForm } from '@/features/career/ui';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function AdminCreateRecommendationScreen() {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');
  const createCareerScenario = useCareerStore(
    (state) => state.createCareerScenario
  );
  const isLoading = useCareerStore((state) => state.isLoading);
  const error = useCareerStore((state) => state.error);

  const handleSubmit = async (
    payload: Parameters<typeof createCareerScenario>[0]
  ) => {
    try {
      await createCareerScenario(payload);
      router.replace('/admin/recommendations');
    } catch {
      // Error is handled in store
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1">
      <AdminHeader title={tCommon('adminRecommendationsTitle')} />
      <CareerScenarioForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={error}
      />
    </View>
  );
}
