import { COUNTRY_LOCATION_TERMS } from '@/features/career/model';
import * as jobsApi from '@/features/jobs/api';
import * as profileApi from '@/features/profile/api/profile.api';
import type { IJobsFilters, Job, JobSalary } from '@/features/jobs/model';
import { formatSalary } from '@/features/jobs/utils/job-form.utils';
import { useProfileStore } from '@/features/profile/store/profile-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { Checkbox } from '@/shared/ui/checkbox/Checkbox';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PORTFOLIO_RESOURCES = [
  { label: 'Behance', url: 'https://www.behance.net/' },
  { label: 'Dribbble', url: 'https://dribbble.com/' },
  { label: 'Tilda', url: 'https://tilda.cc/' },
  { label: 'Wix', url: 'https://www.wix.com/' },
  { label: 'Canva', url: 'https://www.canva.com/' },
];

const PROGRESS_CHECKLIST_ITEMS = [
  {
    id: 'portfolio',
    labelKey: 'portfolio',
  },
  {
    id: 'certificate',
    labelKey: 'certificate',
  },
  {
    id: 'linkedin',
    labelKey: 'linkedin',
  },
  {
    id: 'companies',
    labelKey: 'companies',
  },
  {
    id: 'applications',
    labelKey: 'applications',
  },
] as const;

type ProgressChecklistItemId = (typeof PROGRESS_CHECKLIST_ITEMS)[number]['id'];

interface CareerAbroadProgress {
  completed: Record<ProgressChecklistItemId, boolean>;
  portfolioUrl: string;
  portfolioPdfName: string;
  certificateLinks: {
    id: string;
    title: string;
    url: string;
    description: string;
  }[];
  certificatePdfs: profileApi.CertificatePdfMetadata[];
}

const DEFAULT_PROGRESS: CareerAbroadProgress = {
  completed: {
    portfolio: false,
    certificate: false,
    linkedin: false,
    companies: false,
    applications: false,
  },
  portfolioUrl: '',
  portfolioPdfName: '',
  certificateLinks: [],
  certificatePdfs: [],
};

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

export function CareerAbroadScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const { t: tProfile } = useTranslation('profile');
  const { t: tJobs } = useTranslation('jobs');
  const emptyValue = '—';
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
  const [progress, setProgress] =
    useState<CareerAbroadProgress>(DEFAULT_PROGRESS);
  const [expandedStepId, setExpandedStepId] =
    useState<ProgressChecklistItemId | null>('portfolio');
  const [hydratedProgressStorageKey, setHydratedProgressStorageKey] = useState<
    string | null
  >(null);

  const level = profile?.level
    ? tProfile(`levels.${profile.level}`)
    : emptyValue;
  const direction = profile?.direction
    ? tProfile(`directions.${profile.direction}`)
    : emptyValue;
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
  const salaryRange = averageSalary
    ? formatSalary(averageSalary, tJobs)
    : emptyValue;
  const vacanciesValue = isStatsLoading
    ? emptyValue
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
        <View className="mb-8 rounded-lg border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-800">
          <Text className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {tProfile('careerAbroad.selectedRoute')}
          </Text>
          <Text className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
            {level} {direction} {tProfile('careerAbroad.routeFrom')}{' '}
            <Text className="rounded-md bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              {originCountry}
            </Text>{' '}
            - {tProfile('careerAbroad.routeWorkIn')}{' '}
            <Text className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
              {targetCountry}
            </Text>
          </Text>
        </View>
        <View className="mb-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
          <Text className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-200">
            {tProfile('careerAbroad.marketStats')}
          </Text>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            {tProfile('careerAbroad.vacanciesNow', {
              count: vacanciesValue,
              level,
              direction,
              targetCountry: targetCountryMarketName,
            })}
          </Text>
          <Text className="mt-3 text-base text-gray-700 dark:text-gray-200">
            {tProfile('careerAbroad.averageSalary', {
              salaryRange,
            })}
          </Text>
          {statsError && (
            <Text className="mt-3 text-sm text-red-600 dark:text-red-300">
              {statsError}
            </Text>
          )}
        </View>
        <View className="mb-8 rounded-lg border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-800">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {tProfile('careerAbroad.progress.title')}
            </Text>
            <Text className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {completedStepsCount}/{totalStepsCount}
            </Text>
          </View>
          <View className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <View
              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400"
              style={{ width: progressBarWidth }}
            />
          </View>
          <View className="gap-3">
            {PROGRESS_CHECKLIST_ITEMS.map((item) => {
              const isCompleted = progress.completed[item.id];
              const isExpanded = expandedStepId === item.id;
              const canExpand =
                item.id === 'portfolio' || item.id === 'certificate';

              return (
                <View
                  key={item.id}
                  className="rounded-md border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <View className="flex-row items-center">
                    <View className="mr-3">
                      <Checkbox
                        value={isCompleted}
                        onChange={() => toggleProgressItem(item.id)}
                      />
                    </View>
                    <Pressable
                      onPress={() =>
                        canExpand &&
                        setExpandedStepId(isExpanded ? null : item.id)
                      }
                      disabled={!canExpand}
                      className="flex-1"
                      accessibilityRole={canExpand ? 'button' : undefined}
                      accessibilityState={
                        canExpand ? { expanded: isExpanded } : undefined
                      }
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isCompleted
                            ? 'text-gray-500 line-through dark:text-gray-400'
                            : 'text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {item.id === 'portfolio'
                          ? tProfile('careerAbroad.progress.stepPrefix', {
                              number: 1,
                            })
                          : ''}
                        {item.id === 'certificate'
                          ? tProfile('careerAbroad.progress.stepPrefix', {
                              number: 2,
                            })
                          : ''}
                        {tProfile(
                          `careerAbroad.progress.steps.${item.labelKey}`
                        )}
                      </Text>
                    </Pressable>
                    {canExpand && (
                      <Text className="ml-3 text-lg text-gray-500 dark:text-gray-400">
                        {isExpanded ? '−' : '+'}
                      </Text>
                    )}
                  </View>
                  {item.id === 'portfolio' && isExpanded && (
                    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
                        {tProfile(
                          'careerAbroad.progress.portfolio.description'
                        )}
                      </Text>
                      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {tProfile('careerAbroad.progress.portfolio.resources')}
                      </Text>
                      <View className="mb-4 flex-row flex-wrap gap-2">
                        {PORTFOLIO_RESOURCES.map((resource) => (
                          <Pressable
                            key={resource.url}
                            onPress={() => Linking.openURL(resource.url)}
                            className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 active:opacity-70 dark:border-indigo-700 dark:bg-indigo-950"
                            accessibilityRole="link"
                          >
                            <Text className="text-sm font-medium text-indigo-700 dark:text-indigo-200">
                              {resource.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {tProfile('careerAbroad.progress.portfolio.linkLabel')}
                      </Text>
                      <TextInput
                        value={progress.portfolioUrl}
                        onChangeText={updatePortfolioUrl}
                        placeholder="https://..."
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="mb-4 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {tProfile('careerAbroad.progress.portfolio.pdfLabel')}
                      </Text>
                      <View className="flex-row items-center justify-between rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                        <Pressable
                          onPress={openPortfolioPdf}
                          disabled={!progress.portfolioPdfName}
                          className="mr-3 flex-1"
                          accessibilityRole={
                            progress.portfolioPdfName ? 'link' : undefined
                          }
                        >
                          <Text
                            className={`text-sm ${
                              progress.portfolioPdfName
                                ? 'font-medium text-indigo-700 underline dark:text-indigo-300'
                                : 'text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {progress.portfolioPdfName ||
                              tProfile('careerAbroad.progress.pdfNotSelected')}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={choosePortfolioPdf}
                          disabled={
                            Platform.OS !== 'web' || isPortfolioPdfUploading
                          }
                          className={`rounded-md px-3 py-2 ${
                            Platform.OS === 'web' && !isPortfolioPdfUploading
                              ? 'bg-indigo-600 active:opacity-70 dark:bg-indigo-400'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                          accessibilityRole="button"
                        >
                          <Text
                            className={`text-sm font-medium ${
                              Platform.OS === 'web'
                                ? 'text-white dark:text-gray-900'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {isPortfolioPdfUploading
                              ? tProfile('careerAbroad.progress.uploading')
                              : tProfile('careerAbroad.progress.uploadPdf')}
                          </Text>
                        </Pressable>
                      </View>
                      {portfolioPdfError && (
                        <Text className="mt-2 text-sm text-red-600 dark:text-red-300">
                          {portfolioPdfError}
                        </Text>
                      )}
                    </View>
                  )}
                  {item.id === 'certificate' && isExpanded && (
                    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
                        {tProfile(
                          'careerAbroad.progress.certificates.description'
                        )}
                      </Text>
                      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {tProfile(
                          'careerAbroad.progress.certificates.linkLabel'
                        )}
                      </Text>
                      <TextInput
                        value={certificateDraft.title}
                        onChangeText={(title) =>
                          setCertificateDraft((current) => ({
                            ...current,
                            title,
                          }))
                        }
                        placeholder={tProfile(
                          'careerAbroad.progress.certificates.titlePlaceholder'
                        )}
                        className="mb-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        value={certificateDraft.url}
                        onChangeText={(url) =>
                          setCertificateDraft((current) => ({
                            ...current,
                            url,
                          }))
                        }
                        placeholder="https://..."
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="mb-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        value={certificateDraft.description}
                        onChangeText={(description) =>
                          setCertificateDraft((current) => ({
                            ...current,
                            description,
                          }))
                        }
                        placeholder={tProfile(
                          'careerAbroad.progress.certificates.descriptionPlaceholder'
                        )}
                        multiline
                        className="mb-3 min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholderTextColor="#9CA3AF"
                      />
                      <Pressable
                        onPress={addCertificateLink}
                        className="mb-4 self-start rounded-md bg-indigo-600 px-3 py-2 active:opacity-70 dark:bg-indigo-400"
                        accessibilityRole="button"
                      >
                        <Text className="text-sm font-medium text-white dark:text-gray-900">
                          {tProfile(
                            'careerAbroad.progress.certificates.addLink'
                          )}
                        </Text>
                      </Pressable>
                      {progress.certificateLinks.length > 0 && (
                        <View className="mb-4 gap-2">
                          {progress.certificateLinks.map((certificate) => (
                            <Pressable
                              key={certificate.id}
                              onPress={() => Linking.openURL(certificate.url)}
                              className="rounded-md border border-gray-200 bg-white p-3 active:opacity-70 dark:border-gray-700 dark:bg-gray-800"
                              accessibilityRole="link"
                            >
                              <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                {certificate.title}
                              </Text>
                              {certificate.description && (
                                <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                  {certificate.description}
                                </Text>
                              )}
                            </Pressable>
                          ))}
                        </View>
                      )}
                      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {tProfile(
                          'careerAbroad.progress.certificates.pdfLabel'
                        )}
                      </Text>
                      <Pressable
                        onPress={chooseCertificatePdf}
                        disabled={
                          Platform.OS !== 'web' || isCertificatePdfUploading
                        }
                        className={`mb-3 self-start rounded-md px-3 py-2 ${
                          Platform.OS === 'web' && !isCertificatePdfUploading
                            ? 'bg-indigo-600 active:opacity-70 dark:bg-indigo-400'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        accessibilityRole="button"
                      >
                        <Text
                          className={`text-sm font-medium ${
                            Platform.OS === 'web'
                              ? 'text-white dark:text-gray-900'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {isCertificatePdfUploading
                            ? tProfile('careerAbroad.progress.uploading')
                            : tProfile('careerAbroad.progress.uploadPdf')}
                        </Text>
                      </Pressable>
                      <View className="gap-2">
                        {progress.certificatePdfs.map((certificate) => (
                          <Pressable
                            key={certificate._id}
                            onPress={() => openCertificatePdf(certificate._id)}
                            className="rounded-md border border-gray-200 bg-white p-3 active:opacity-70 dark:border-gray-700 dark:bg-gray-800"
                            accessibilityRole="link"
                          >
                            <Text className="text-sm font-medium text-indigo-700 underline dark:text-indigo-300">
                              {certificate.name}
                            </Text>
                          </Pressable>
                        ))}
                        {progress.certificatePdfs.length === 0 && (
                          <Text className="text-sm text-gray-600 dark:text-gray-300">
                            {tProfile(
                              'careerAbroad.progress.certificates.emptyPdfs'
                            )}
                          </Text>
                        )}
                      </View>
                      {certificatePdfError && (
                        <Text className="mt-2 text-sm text-red-600 dark:text-red-300">
                          {certificatePdfError}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
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
