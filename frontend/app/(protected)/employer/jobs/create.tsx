import { useAuthStore } from '@/features/auth/store/auth.store';
import { useEmployerStore } from '@/features/employer/store/employer-store';
import { JobForm } from '@/features/jobs/ui';
import { UserType } from '@/shared/model';
import { FullScreenLoader } from '@/shared/ui';
import { type Href, Redirect, router } from 'expo-router';
import { useEffect } from 'react';

export default function EmployerCreateJobScreen() {
  const userType = useAuthStore((state) => state.user?.userType);
  const company = useEmployerStore((state) => state.company);
  const companyHydrated = useEmployerStore((state) => state.companyHydrated);
  const isLoadingCompany = useEmployerStore((state) => state.isLoadingCompany);
  const isSavingOwnJob = useEmployerStore((state) => state.isSavingOwnJob);
  const error = useEmployerStore((state) => state.error);
  const fetchCompany = useEmployerStore((state) => state.fetchCompany);
  const createOwnJob = useEmployerStore((state) => state.createOwnJob);

  useEffect(() => {
    if (!companyHydrated) void fetchCompany();
  }, [companyHydrated, fetchCompany]);

  if (!userType) return <Redirect href="/choose-path" />;
  if (userType !== UserType.EMPLOYER) return <Redirect href="/jobs" />;
  if (isLoadingCompany || !companyHydrated) return <FullScreenLoader />;
  if (!company) return <Redirect href="/employer/profile" />;

  return (
    <JobForm
      employerMode
      hideActiveToggle
      companyName={company.name}
      onSubmit={async ({ isActive: _isActive, ...payload }) => {
        const job = await createOwnJob(payload);
        router.replace(`/employer/jobs/${job._id}` as Href);
      }}
      onCancel={() => router.replace('/employer/jobs' as Href)}
      isLoading={isSavingOwnJob}
      error={error}
    />
  );
}
