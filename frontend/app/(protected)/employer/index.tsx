import { useAuthStore } from '@/features/auth/store/auth.store';
import { SpecialistCardView } from '@/features/employer/ui/SpecialistCardView';
import { SpecialistFiltersPanel } from '@/features/employer/ui/SpecialistFiltersPanel';
import { useEmployerStore } from '@/features/employer/store/employer-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { EmployerContactKind, UserType } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { FullScreenLoader } from '@/src/shared/ui';
import { type Href, Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import type { SpecialistCard } from '@/features/employer/model';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmployerHomeScreen() {
  const { t } = useTranslation('employer');
  const userType = useAuthStore((state) => state.user?.userType);
  const company = useEmployerStore((state) => state.company);
  const companyHydrated = useEmployerStore((state) => state.companyHydrated);
  const specialists = useEmployerStore((state) => state.specialists);
  const page = useEmployerStore((state) => state.specialistsPage);
  const total = useEmployerStore((state) => state.specialistsTotal);
  const limit = useEmployerStore((state) => state.specialistsLimit);
  const listRef = useRef<FlatList<SpecialistCard>>(null);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const filters = useEmployerStore((state) => state.filters);
  const error = useEmployerStore((state) => state.error);
  const isLoadingCompany = useEmployerStore((state) => state.isLoadingCompany);
  const isLoadingSpecialists = useEmployerStore(
    (state) => state.isLoadingSpecialists
  );
  const contactingId = useEmployerStore((state) => state.contactingId);
  const fetchCompany = useEmployerStore((state) => state.fetchCompany);
  const fetchSpecialists = useEmployerStore((state) => state.fetchSpecialists);
  const setFilters = useEmployerStore((state) => state.setFilters);
  const contactSpecialist = useEmployerStore(
    (state) => state.contactSpecialist
  );

  useEffect(() => {
    void fetchCompany();
  }, [fetchCompany]);

  useFocusEffect(
    useCallback(() => {
      if (companyHydrated) {
        void fetchSpecialists();
      }
    }, [companyHydrated, fetchSpecialists])
  );

  if (!userType) {
    return <Redirect href="/choose-path" />;
  }
  if (userType !== UserType.EMPLOYER) {
    return <Redirect href="/jobs" />;
  }

  if (isLoadingCompany && !companyHydrated) {
    return <FullScreenLoader />;
  }

  const handleContact = async (
    profileId: string,
    kind: EmployerContactKind,
    message?: string
  ) => {
    try {
      await contactSpecialist(profileId, { kind, message });
      Alert.alert(t('specialists.sent'));
    } catch {
      const currentError = useEmployerStore.getState().error;
      Alert.alert(
        currentError === 'alreadySent'
          ? t('specialists.alreadySent')
          : currentError === 'needProfile'
            ? t('specialists.needProfile')
            : currentError || t('specialists.empty')
      );
    }
  };

  const changePage = async (nextPage: number) => {
    if (isLoadingSpecialists || nextPage < 1 || nextPage > totalPages) return;
    await fetchSpecialists(nextPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <FlatList
        ref={listRef}
        refreshing={isLoadingSpecialists}
        onRefresh={() => void fetchSpecialists()}
        data={specialists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {t('specialists.title')}
            </Text>
            <Text className="mb-4 text-base text-gray-600 dark:text-gray-300">
              {t('specialists.subtitle')}
            </Text>
            {!company ? (
              <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                <Text className="mb-3 text-sm text-amber-900 dark:text-amber-100">
                  {t('profile.empty')}
                </Text>
                <PrimaryButton
                  className="mb-0"
                  onPress={() => router.push('/employer/profile' as Href)}
                >
                  {t('profile.create')}
                </PrimaryButton>
              </View>
            ) : null}
            <SpecialistFiltersPanel
              filters={filters}
              isLoading={isLoadingSpecialists}
              onApply={(next) => {
                setFilters(next);
                void fetchSpecialists();
              }}
            />
            <Text
              className="mb-3 text-sm text-gray-500 dark:text-gray-400"
              accessibilityLiveRegion="polite"
            >
              {t('specialists.total', { count: total })}
            </Text>
            {error && error !== 'alreadySent' && error !== 'needProfile' ? (
              <Text className="mb-3 text-sm text-red-600">{error}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoadingSpecialists ? (
            <FullScreenLoader />
          ) : (
            <Text className="mt-8 text-center text-gray-500 dark:text-gray-400">
              {t('specialists.empty')}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <SpecialistCardView
            item={item}
            isContacting={contactingId === item.id}
            onContact={(kind, message) => handleContact(item.id, kind, message)}
          />
        )}
        ListFooterComponent={
          totalPages > 1 ? (
            <View className="mt-4 flex-row flex-wrap items-center justify-between gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoadingSpecialists || page === 1,
                }}
                disabled={isLoadingSpecialists || page === 1}
                onPress={() => void changePage(page - 1)}
                className={`rounded-lg bg-blue-600 px-4 py-3 ${isLoadingSpecialists || page === 1 ? 'opacity-40' : ''}`}
              >
                <Text className="font-medium text-white">
                  {t('specialists.previous')}
                </Text>
              </Pressable>
              <Text
                className="text-sm text-gray-600 dark:text-gray-300"
                accessibilityLiveRegion="polite"
              >
                {t('specialists.page', { page, total: totalPages })}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoadingSpecialists || page === totalPages,
                }}
                disabled={isLoadingSpecialists || page === totalPages}
                onPress={() => void changePage(page + 1)}
                className={`rounded-lg bg-blue-600 px-4 py-3 ${isLoadingSpecialists || page === totalPages ? 'opacity-40' : ''}`}
              >
                <Text className="font-medium text-white">
                  {t('specialists.next')}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
