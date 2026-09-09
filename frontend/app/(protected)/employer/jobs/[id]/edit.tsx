import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEmployerStore } from '@/features/employer/store/employer-store';
import { JobForm } from '@/features/jobs/ui';
import { UserType } from '@/shared/model';
import { FullScreenLoader } from '@/shared/ui';
import { type Href, Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export default function EmployerEditJobScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const userType = useAuthStore((state) => state.user?.userType);
  const company = useEmployerStore((state) => state.company);
  const companyHydrated = useEmployerStore((state) => state.companyHydrated);
  const job = useEmployerStore((state) => state.selectedOwnJob);
  const isLoadingCompany = useEmployerStore((state) => state.isLoadingCompany);
  const isLoadingOwnJobs = useEmployerStore((state) => state.isLoadingOwnJobs);
  const isSavingOwnJob = useEmployerStore((state) => state.isSavingOwnJob);
  const error = useEmployerStore((state) => state.error);
  const fetchCompany = useEmployerStore((state) => state.fetchCompany);
  const fetchOwnJob = useEmployerStore((state) => state.fetchOwnJob);
  const updateOwnJob = useEmployerStore((state) => state.updateOwnJob);
  const resetSelectedOwnJob = useEmployerStore(
    (state) => state.resetSelectedOwnJob
  );

  useEffect(() => {
    if (!companyHydrated) void fetchCompany();
  }, [companyHydrated, fetchCompany]);

  useEffect(() => {
    if (id) void fetchOwnJob(id);
    return resetSelectedOwnJob;
  }, [fetchOwnJob, id, resetSelectedOwnJob]);

  if (!userType) return <Redirect href="/choose-path" />;
  if (userType !== UserType.EMPLOYER) return <Redirect href="/jobs" />;
  if (
    !id ||
    !companyHydrated ||
    isLoadingCompany ||
    (isLoadingOwnJobs && !job)
  ) {
    return <FullScreenLoader />;
  }
  if (!company) return <Redirect href="/employer/profile" />;
  if (!job) return <Redirect href={'/employer/jobs' as Href} />;

  return (
    <JobForm
      employerMode
      companyName={company.name}
      initialValues={job}
      titleKey="editTitle"
      onSubmit={async (payload) => {
        await updateOwnJob(id, payload);
        router.replace(`/employer/jobs/${id}` as Href);
      }}
      onCancel={() => router.replace(`/employer/jobs/${id}` as Href)}
      isLoading={isSavingOwnJob}
      error={error}
    />
  );
}
