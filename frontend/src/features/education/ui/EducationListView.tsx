import type {
  EducationsFilters,
  EducationResource,
} from '@/features/education/api/education.api';
import { EducationCard } from '@/features/education/ui/EducationCard';
import { EducationsFiltersPanel } from '@/features/education/ui/EducationsFiltersPanel';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import type React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EducationListViewProps {
  educations: EducationResource[];
  filters: EducationsFilters;
  isLoading: boolean;
  error: string | null;
  headerRight?: React.ReactNode;
  onApplyFilters: (filters: EducationsFilters) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
}

export function EducationListView({
  educations,
  filters,
  isLoading,
  error,
  headerRight,
  onApplyFilters,
  onResetFilters,
  onRefresh,
}: EducationListViewProps) {
  const { t } = useTranslation('common');
  const { t: tCareer } = useTranslation('career');

  function translateDirection(direction: string) {
    const translated = tCareer(`directions.${direction}`);
    return translated === `directions.${direction}` ? direction : translated;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('educations.mainTitle')}
        </Text>
        <View className="flex-row items-center">{headerRight}</View>
      </View>

      <FlatList
        className="flex-1 px-4"
        data={educations}
        keyExtractor={(item) => item._id || item.id || item.title}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 16,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {error && (
              <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
                <Text className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </Text>
              </View>
            )}

            <EducationsFiltersPanel
              filters={filters}
              isLoading={isLoading}
              onApply={onApplyFilters}
              onReset={onResetFilters}
              t={t}
            />
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="mt-10 items-center">
              <Text className="text-gray-500 dark:text-gray-400">
                {t('educations.empty')}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <EducationCard
            education={item}
            t={t}
            translateDirection={translateDirection}
          />
        )}
      />
    </SafeAreaView>
  );
}
