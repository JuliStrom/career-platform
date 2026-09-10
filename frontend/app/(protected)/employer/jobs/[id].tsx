import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEmployerStore } from '@/features/employer/store/employer-store';
import { JobDetailsView } from '@/features/jobs/ui/JobDetailsView';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { UserType } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { type Href, Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export default function EmployerJobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation('employer');
  const userType = useAuthStore((state) => state.user?.userType);
  const job = useEmployerStore((state) => state.selectedOwnJob);
  const isLoading = useEmployerStore((state) => state.isLoadingOwnJobs);
  const isDeactivating = useEmployerStore(
    (state) => state.isDeactivatingOwnJob
  );
  const error = useEmployerStore((state) => state.error);
  const fetchOwnJob = useEmployerStore((state) => state.fetchOwnJob);
  const deactivateOwnJob = useEmployerStore((state) => state.deactivateOwnJob);
  const updateOwnJob = useEmployerStore((state) => state.updateOwnJob);
  const isSaving = useEmployerStore((state) => state.isSavingOwnJob);
  const resetSelectedOwnJob = useEmployerStore(
    (state) => state.resetSelectedOwnJob
  );

  useEffect(() => {
    if (id) void fetchOwnJob(id);
    return resetSelectedOwnJob;
  }, [fetchOwnJob, id, resetSelectedOwnJob]);

  if (!userType) return <Redirect href="/choose-path" />;
  if (userType !== UserType.EMPLOYER) return <Redirect href="/jobs" />;

  async function handleResume() {
    if (!id || !job || job.isActive || isSaving || isDeactivating) return;
    try {
      await updateOwnJob(id, { isActive: true });
    } catch {
      // The store exposes the API error in JobDetailsView.
    }
  }

  async function handleDeactivate() {
    if (!id || !job?.isActive || isSaving || isDeactivating) return;
    try {
      await deactivateOwnJob(id);
    } catch {
      // The store exposes the API error in JobDetailsView.
    }
  }

  return (
    <JobDetailsView
      job={job}
      error={error}
      isLoading={isLoading || !id}
      onBack={() => router.replace('/employer/jobs' as Href)}
      actions={
        <>
          <PrimaryButton
            onPress={() => router.push(`/employer/jobs/${id}/edit` as Href)}
            disabled={!job || isSaving || isDeactivating}
          >
            {t('jobs.edit')}
          </PrimaryButton>
          {job?.isActive ? (
            <PrimaryButton
              onPress={() => void handleDeactivate()}
              isLoading={isDeactivating}
              disabled={isDeactivating || isSaving}
              className="mb-0 bg-red-600"
            >
              {t('jobs.deactivate')}
            </PrimaryButton>
          ) : job ? (
            <PrimaryButton
              onPress={() => void handleResume()}
              isLoading={isSaving}
              disabled={isSaving || isDeactivating}
              className="mb-0 bg-green-600 dark:bg-green-600"
            >
              {t('jobs.resume')}
            </PrimaryButton>
          ) : null}
        </>
      }
    />
  );
}
