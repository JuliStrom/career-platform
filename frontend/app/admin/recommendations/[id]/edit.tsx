import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useCareerStore } from '@/features/career/store';
import { CareerScenarioForm } from '@/features/career/ui';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminEditRecommendationScreen() {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('career');
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const updateScenario = useCareerStore((state) => state.updateScenario);
  const fetchScenarioById = useCareerStore((state) => state.fetchScenarioById);
  const selectedScenario = useCareerStore((state) => state.selectedScenario);
  const isLoading = useCareerStore((state) => state.isLoadingScenarios);
  const isUpdating = useCareerStore((state) => state.isUpdating);
  const error = useCareerStore((state) => state.error);

  useEffect(() => {
    if (!id) {
      router.replace('/admin/recommendations');
      return;
    }

    fetchScenarioById(id);
  }, [id, router, fetchScenarioById]);

  const handleSubmit = async (
    payload: Parameters<typeof updateScenario>[1]
  ) => {
    if (!id) return;

    try {
      await updateScenario(id, payload);
      router.replace(`/admin/recommendations/${id}`);
    } catch {
      // Error is handled in store
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!id) {
    return null;
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  const scenarioMatches =
    selectedScenario != null && String(selectedScenario._id) === String(id);

  if (!scenarioMatches) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <AdminHeader title={tCommon('adminRecommendationsTitle')} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-gray-600 dark:text-gray-400">
            {error || t('scenarios.notFound')}
          </Text>
          <PrimaryButton
            onPress={() => router.replace('/admin/recommendations')}
            className="mb-0 px-6"
          >
            {t('scenarios.back')}
          </PrimaryButton>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <AdminHeader title={tCommon('adminRecommendationsTitle')} />
      <CareerScenarioForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        error={error}
        initialValues={{
          title: selectedScenario.title,
          description: selectedScenario.description,
          direction: selectedScenario.direction,
          level: selectedScenario.level,
          isActive: selectedScenario.isActive,
          actions: selectedScenario.actions,
        }}
        titleKey="scenarios.editTitle"
        submitLabelKey="form.saveChanges"
      />
    </View>
  );
}
