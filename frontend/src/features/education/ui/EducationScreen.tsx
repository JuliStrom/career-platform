import {
  fetchEducations,
  type EducationsFilters,
  type EducationResource,
} from '@/features/education/api/education.api';
import { EducationListView } from '@/features/education/ui/EducationListView';
import { useExitOrBack } from '@/shared/lib/hooks/useExitOrBack';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { IconNavPressable } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export function EducationScreen() {
  const router = useRouter();
  const exitOrBack = useExitOrBack();
  const { t } = useTranslation('common');
  const [educations, setEducations] = useState<EducationResource[]>([]);
  const [filters, setFilters] = useState<EducationsFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextFilters: EducationsFilters = filters) => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await fetchEducations(nextFilters);
        setEducations(data);
      } catch {
        setError(t('errors.networkError'));
      } finally {
        setIsLoading(false);
      }
    },
    [filters, t]
  );

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [load]);

  function handleApplyFilters(nextFilters: EducationsFilters) {
    setFilters(nextFilters);
    load(nextFilters);
  }

  function handleResetFilters() {
    setFilters({});
    load({});
  }

  return (
    <EducationListView
      educations={educations}
      filters={filters}
      isLoading={isLoading}
      error={error}
      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      onRefresh={() => load()}
      headerRight={
        <>
          <IconNavPressable
            name="arrow-back"
            accessibilityLabel={t('back')}
            onPress={exitOrBack}
          />
          <IconNavPressable
            name="home"
            accessibilityLabel={t('educations.goHome')}
            onPress={() => router.replace('/profile')}
          />
        </>
      }
    />
  );
}
