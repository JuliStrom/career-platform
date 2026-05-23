import { analytics } from '@/features/analytics/lib/track';
import { useJobsStore } from '@/features/jobs/store';
import { JobDetailsView } from '@/features/jobs/ui/JobDetailsView';
import { useProfileStore } from '@/features/profile/store/profile-store';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';

/** Сегменты SPA, которые не являются id вакансии: /jobs/profile → иначе уходит GET /api/jobs/profile и 400. */
const REDIRECT_FROM_JOBS_ID: Record<string, string> = {
  profile: '/profile',
  recommendations: '/recommendations',
  admin: '/admin',
};

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const profile = useProfileStore((state) => state.profile);
  const {
    selectedJob,
    isLoading,
    error,
    favoriteJobs,
    fetchJobById,
    resetSelectedJob,
    fetchFavoriteJobs,
    addToFavorites,
    removeFromFavorites,
    isTogglingFavorite,
  } = useJobsStore();
  const router = useRouter();

  const redirectPath = useMemo(() => {
    if (!id) return null;
    return REDIRECT_FROM_JOBS_ID[id.toLowerCase()] ?? null;
  }, [id]);

  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath as Href);
    }
  }, [redirectPath, router]);

  /** Всегда на список вакансий (router.back() часто возвращает на профиль из-за табов). */
  const handleBack = useCallback(() => {
    router.replace('/jobs');
  }, [router]);

  useEffect(() => {
    if (!id || redirectPath) {
      return () => {
        resetSelectedJob();
      };
    }

    analytics.jobViewed(id);
    fetchJobById(id);

    return () => {
      resetSelectedJob();
    };
  }, [id, redirectPath, fetchJobById, resetSelectedJob]);

  useEffect(() => {
    if (profile) {
      fetchFavoriteJobs();
    }
  }, [profile, fetchFavoriteJobs]);

  const isFavorite = id ? favoriteJobs.some((j) => j._id === id) : false;

  if (redirectPath) {
    return null;
  }

  async function handleToggleFavorite() {
    if (!id) return;
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
      } else {
        analytics.jobFavorited(id);
        await addToFavorites(id);
      }
    } catch {
      // error already shown in store
    }
  }

  return (
    <JobDetailsView
      job={selectedJob}
      error={error}
      isLoading={isLoading || !id}
      onBack={handleBack}
      actions={
        profile ? (
          <PrimaryButton
            onPress={handleToggleFavorite}
            disabled={isTogglingFavorite}
            isLoading={isTogglingFavorite}
          >
            {isFavorite ? 'Убрать из избранного' : 'В избранное'}
          </PrimaryButton>
        ) : undefined
      }
    />
  );
}
