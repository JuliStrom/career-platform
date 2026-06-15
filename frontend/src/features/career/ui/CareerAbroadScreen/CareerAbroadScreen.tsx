import {
  COUNTRY_LOCATION_TERMS,
  DEFAULT_PROGRESS,
  EMPTY_ROUTE_VALUE,
  PROGRESS_CHECKLIST_ITEMS,
  type CareerAbroadProgress,
  type CompanySummary,
  type ProgressChecklistItemId,
  type VisaOptionId,
} from '@/features/career/model';
import * as jobsApi from '@/features/jobs/api';
import type { IJobsFilters, Job, JobSalary } from '@/features/jobs/model';
import { formatSalary } from '@/features/jobs/utils/job-form.utils';
import * as profileApi from '@/features/profile/api/profile.api';
import { useProfileStore } from '@/features/profile/store/profile-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketStatsCard } from './MarketStatsCard/MarketStatsCard';
import { ProgressTracker } from './ProgressTracker/ProgressTracker';
import { RouteSummaryCard } from './RouteSummaryCard/RouteSummaryCard';

function normalizeProgress(value: unknown): CareerAbroadProgress {
  if (!value || typeof value !== 'object') return DEFAULT_PROGRESS;

  const progress = value as Partial<CareerAbroadProgress>;

  return {
    completed: {
      ...DEFAULT_PROGRESS.completed,
      ...(progress.completed ?? {}),
    },
    portfolioUrl: progress.portfolioUrl ?? '',
    portfolioPdfName: progress.portfolioPdfName ?? '',
    linkedinUrl: progress.linkedinUrl ?? '',
    certificateLinks: progress.certificateLinks ?? [],
    certificatePdfs: progress.certificatePdfs ?? [],
  };
}

function calculateAverageSalary(jobs: Job[]): JobSalary | null {
  const salaries = jobs
    .map((job) => job.salary)
    .filter(
      (salary): salary is JobSalary =>
        Boolean(salary) &&
        (salary.min !== undefined || salary.max !== undefined)
    );

  if (salaries.length === 0) return null;

  const currencyCounts = salaries.reduce<Record<string, number>>(
    (acc, salary) => {
      acc[salary.currency] = (acc[salary.currency] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const currency = Object.entries(currencyCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] as JobSalary['currency'] | undefined;

  if (!currency) return null;

  const matchingSalaries = salaries.filter(
    (salary) => salary.currency === currency
  );
  const minValues = matchingSalaries
    .map((salary) => salary.min)
    .filter((value): value is number => value !== undefined);
  const maxValues = matchingSalaries
    .map((salary) => salary.max)
    .filter((value): value is number => value !== undefined);
  const average = (values: number[]) =>
    Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

  return {
    min: minValues.length > 0 ? average(minValues) : undefined,
    max: maxValues.length > 0 ? average(maxValues) : undefined,
    currency,
  };
}

function getCompanySummaries(jobs: Job[]): CompanySummary[] {
  const companies = jobs.reduce<Map<string, CompanySummary>>((acc, job) => {
    const name = job.company.trim();
    if (!name) return acc;

    const key = name.toLocaleLowerCase();
    const current = acc.get(key);

    if (!current) {
      acc.set(key, {
        name,
        vacanciesCount: 1,
        locations: job.location ? [job.location] : [],
      });
      return acc;
    }

    current.vacanciesCount += 1;
    if (job.location && !current.locations.includes(job.location)) {
      current.locations.push(job.location);
    }

    return acc;
  }, new Map<string, CompanySummary>());

  return Array.from(companies.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function CareerAbroadScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const { t: tProfile } = useTranslation('profile');
  const { t: tJobs } = useTranslation('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [vacanciesCount, setVacanciesCount] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [portfolioPdfError, setPortfolioPdfError] = useState<string | null>(
    null
  );
  const [certificatePdfError, setCertificatePdfError] = useState<string | null>(
    null
  );
  const [isPortfolioPdfUploading, setIsPortfolioPdfUploading] = useState(false);
  const [isCertificatePdfUploading, setIsCertificatePdfUploading] =
    useState(false);
  const [certificateDraft, setCertificateDraft] = useState({
    title: '',
    url: '',
    description: '',
  });
  const [selectedVisaOptionId, setSelectedVisaOptionId] =
    useState<VisaOptionId>('visaCenter');
  const [progress, setProgress] =
    useState<CareerAbroadProgress>(DEFAULT_PROGRESS);
  const [expandedStepId, setExpandedStepId] =
    useState<ProgressChecklistItemId | null>(null);
  const [hydratedProgressStorageKey, setHydratedProgressStorageKey] = useState<
    string | null
  >(null);

  const level = profile?.level
    ? tProfile(`levels.${profile.level}`)
    : EMPTY_ROUTE_VALUE;
  const direction = profile?.direction
    ? tProfile(`directions.${profile.direction}`)
    : EMPTY_ROUTE_VALUE;
  const originCountry = tProfile('relocationOrigins.kazakhstan');
  const targetCountry = profile?.relocationToCountry
    ? tProfile(`relocationCountries.${profile.relocationToCountry}`)
    : tProfile('relocationCountries.canada');
  const targetCountryMarketName = profile?.relocationToCountry
    ? tProfile(`relocationCountryMarketNames.${profile.relocationToCountry}`)
    : tProfile('relocationCountryMarketNames.canada');
  const jobsFilters = useMemo<IJobsFilters>(() => {
    const targetCountryKey = profile?.relocationToCountry ?? 'canada';

    return {
      direction: profile?.direction,
      level: profile?.level,
      location: COUNTRY_LOCATION_TERMS[targetCountryKey],
      limit: 100,
    };
  }, [profile?.direction, profile?.level, profile?.relocationToCountry]);
  const averageSalary = useMemo(() => calculateAverageSalary(jobs), [jobs]);
  const companySummaries = useMemo(() => getCompanySummaries(jobs), [jobs]);
  const salaryRange = averageSalary
    ? formatSalary(averageSalary, tJobs)
    : EMPTY_ROUTE_VALUE;
  const vacanciesValue = isStatsLoading
    ? EMPTY_ROUTE_VALUE
    : (vacanciesCount ?? jobs.length);
  const progressStorageKey = useMemo(
    () =>
      [
        'career-abroad-progress',
        profile?.name ?? 'guest',
        profile?.direction ?? 'any-direction',
        profile?.level ?? 'any-level',
        profile?.relocationToCountry ?? 'canada',
      ].join(':'),
    [
      profile?.direction,
      profile?.level,
      profile?.name,
      profile?.relocationToCountry,
    ]
  );
  const completedStepsCount = PROGRESS_CHECKLIST_ITEMS.filter(
    (item) => progress.completed[item.id]
  ).length;
  const totalStepsCount = PROGRESS_CHECKLIST_ITEMS.length;
  const progressPercent = Math.round(
    (completedStepsCount / totalStepsCount) * 100
  );
  const progressBarWidth = `${progressPercent}%` as `${number}%`;

  function toggleProgressItem(id: ProgressChecklistItemId) {
    setProgress((current) => ({
      ...current,
      completed: {
        ...current.completed,
        [id]: !current.completed[id],
      },
    }));
  }

  function updatePortfolioUrl(portfolioUrl: string) {
    setProgress((current) => ({
      ...current,
      portfolioUrl,
    }));
  }

  function updatePortfolioPdfName(portfolioPdfName: string) {
    setProgress((current) => ({
      ...current,
      portfolioPdfName,
    }));
  }

  function updateLinkedinUrl(linkedinUrl: string) {
    setProgress((current) => ({
      ...current,
      linkedinUrl,
    }));
  }

  function openLinkedinProfile() {
    const linkedinUrl = progress.linkedinUrl.trim();
    if (!linkedinUrl) return;

    const normalizedUrl = /^https?:\/\//i.test(linkedinUrl)
      ? linkedinUrl
      : `https://${linkedinUrl}`;

    Linking.openURL(normalizedUrl);
  }

  function addCertificateLink() {
    const title = certificateDraft.title.trim();
    const url = certificateDraft.url.trim();
    const description = certificateDraft.description.trim();
    if (!title || !url) return;

    setProgress((current) => ({
      ...current,
      certificateLinks: [
        ...current.certificateLinks,
        {
          id: `${Date.now()}`,
          title,
          url,
          description,
        },
      ],
    }));
    setCertificateDraft({ title: '', url: '', description: '' });
  }

  function chooseCertificatePdf() {
    if (Platform.OS !== 'web') return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setIsCertificatePdfUploading(true);
      setCertificatePdfError(null);

      try {
        const certificate = await profileApi.uploadCertificatePdfFile(file);
        setProgress((current) => ({
          ...current,
          certificatePdfs: [...current.certificatePdfs, certificate],
        }));
      } catch (error) {
        setCertificatePdfError(
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        setIsCertificatePdfUploading(false);
      }
    };
    input.click();
  }

  async function openCertificatePdf(id: string) {
    if (Platform.OS !== 'web') return;

    setCertificatePdfError(null);

    try {
      const blob = await profileApi.getCertificatePdfFile(id);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      setCertificatePdfError(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  function choosePortfolioPdf() {
    if (Platform.OS !== 'web') return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setIsPortfolioPdfUploading(true);
      setPortfolioPdfError(null);

      try {
        const response = await profileApi.uploadPortfolioPdfFile(file);
        updatePortfolioPdfName(response.portfolioPdfName);
      } catch (error) {
        setPortfolioPdfError(
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        setIsPortfolioPdfUploading(false);
      }
    };
    input.click();
  }

  async function openPortfolioPdf() {
    if (Platform.OS !== 'web' || !progress.portfolioPdfName) return;

    setPortfolioPdfError(null);

    try {
      const blob = await profileApi.getPortfolioPdfFile();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      setPortfolioPdfError(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchMarketStats() {
      setIsStatsLoading(true);
      setStatsError(null);

      try {
        const response = await jobsApi.getJobs(jobsFilters);

        if (!isMounted) return;

        setJobs(response.jobs);
        setVacanciesCount(response.total);
      } catch (error) {
        if (!isMounted) return;

        setJobs([]);
        setVacanciesCount(0);
        setStatsError(error instanceof Error ? error.message : String(error));
      } finally {
        if (isMounted) setIsStatsLoading(false);
      }
    }

    fetchMarketStats();

    return () => {
      isMounted = false;
    };
  }, [jobsFilters]);

  useEffect(() => {
    setHydratedProgressStorageKey(null);

    if (Platform.OS !== 'web') {
      setProgress(DEFAULT_PROGRESS);
      setHydratedProgressStorageKey(progressStorageKey);
      return;
    }

    try {
      const savedProgress = localStorage.getItem(progressStorageKey);
      const saved = savedProgress
        ? normalizeProgress(JSON.parse(savedProgress))
        : DEFAULT_PROGRESS;

      setProgress({
        ...saved,
        portfolioPdfName:
          saved.portfolioPdfName || profile?.portfolioPdfName || '',
        certificatePdfs:
          saved.certificatePdfs.length > 0
            ? saved.certificatePdfs
            : (profile?.certificatePdfs ?? []),
      });
    } catch {
      setProgress({
        ...DEFAULT_PROGRESS,
        portfolioPdfName: profile?.portfolioPdfName || '',
        certificatePdfs: profile?.certificatePdfs ?? [],
      });
    } finally {
      setHydratedProgressStorageKey(progressStorageKey);
    }
  }, [profile?.certificatePdfs, profile?.portfolioPdfName, progressStorageKey]);

  useEffect(() => {
    if (
      hydratedProgressStorageKey !== progressStorageKey ||
      Platform.OS !== 'web'
    ) {
      return;
    }

    localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  }, [hydratedProgressStorageKey, progress, progressStorageKey]);

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
          {tProfile('careerAbroad.title')}
        </Text>
        <Text className="mb-8 text-base text-gray-600 dark:text-gray-300">
          {tProfile('careerAbroad.description')}
        </Text>
        <RouteSummaryCard
          level={level}
          direction={direction}
          originCountry={originCountry}
          targetCountry={targetCountry}
        />
        <MarketStatsCard
          vacanciesValue={vacanciesValue}
          level={level}
          direction={direction}
          targetCountryMarketName={targetCountryMarketName}
          salaryRange={salaryRange}
          statsError={statsError}
        />
        <ProgressTracker
          progress={progress}
          completedStepsCount={completedStepsCount}
          totalStepsCount={totalStepsCount}
          progressBarWidth={progressBarWidth}
          expandedStepId={expandedStepId}
          certificateDraft={certificateDraft}
          portfolioPdfError={portfolioPdfError}
          certificatePdfError={certificatePdfError}
          isPortfolioPdfUploading={isPortfolioPdfUploading}
          isCertificatePdfUploading={isCertificatePdfUploading}
          companySummaries={companySummaries}
          isStatsLoading={isStatsLoading}
          targetCountry={targetCountry}
          targetCountryMarketName={targetCountryMarketName}
          selectedVisaOptionId={selectedVisaOptionId}
          onProgressItemToggle={toggleProgressItem}
          onExpandedStepChange={setExpandedStepId}
          onPortfolioUrlChange={updatePortfolioUrl}
          onChoosePortfolioPdf={choosePortfolioPdf}
          onOpenPortfolioPdf={openPortfolioPdf}
          onCertificateDraftChange={setCertificateDraft}
          onAddCertificateLink={addCertificateLink}
          onChooseCertificatePdf={chooseCertificatePdf}
          onOpenCertificatePdf={openCertificatePdf}
          onLinkedinUrlChange={updateLinkedinUrl}
          onOpenLinkedinProfile={openLinkedinProfile}
          onVisaOptionChange={setSelectedVisaOptionId}
        />
        <PrimaryButton
          onPress={() => router.back()}
          accessibilityLabel={tProfile('careerAbroad.backButton')}
        >
          {tProfile('careerAbroad.backButton')}
        </PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
}
