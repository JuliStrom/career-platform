import { CertificatesStepDetails } from '../CertificatesStepDetails/CertificatesStepDetails';
import { CompaniesStepDetails } from '../CompaniesStepDetails/CompaniesStepDetails';
import {
  PROGRESS_CHECKLIST_ITEMS,
  type CareerAbroadProgress,
  type CertificateDraft,
  type CompanySummary,
  type ProgressChecklistItemId,
  type VisaOptionId,
} from '@/features/career/model';
import { LinkedinStepDetails } from '../LinkedinStepDetails/LinkedinStepDetails';
import { PortfolioStepDetails } from '../PortfolioStepDetails/PortfolioStepDetails';
import { VisaStepDetails } from '../VisaStepDetails/VisaStepDetails';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Checkbox } from '@/shared/ui/checkbox/Checkbox';
import type { Dispatch, SetStateAction } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProgressTrackerProps {
  progress: CareerAbroadProgress;
  completedStepsCount: number;
  totalStepsCount: number;
  progressBarWidth: `${number}%`;
  expandedStepId: ProgressChecklistItemId | null;
  certificateDraft: CertificateDraft;
  portfolioPdfError: string | null;
  certificatePdfError: string | null;
  isPortfolioPdfUploading: boolean;
  isCertificatePdfUploading: boolean;
  companySummaries: CompanySummary[];
  isStatsLoading: boolean;
  targetCountry: string;
  targetCountryMarketName: string;
  selectedVisaOptionId: VisaOptionId;
  onProgressItemToggle: (id: ProgressChecklistItemId) => void;
  onExpandedStepChange: (id: ProgressChecklistItemId | null) => void;
  onPortfolioUrlChange: (portfolioUrl: string) => void;
  onChoosePortfolioPdf: () => void;
  onOpenPortfolioPdf: () => void;
  onCertificateDraftChange: Dispatch<SetStateAction<CertificateDraft>>;
  onAddCertificateLink: () => void;
  onChooseCertificatePdf: () => void;
  onOpenCertificatePdf: (id: string) => void;
  onLinkedinUrlChange: (linkedinUrl: string) => void;
  onOpenLinkedinProfile: () => void;
  onVisaOptionChange: (id: VisaOptionId) => void;
}

export function ProgressTracker({
  progress,
  completedStepsCount,
  totalStepsCount,
  progressBarWidth,
  expandedStepId,
  certificateDraft,
  portfolioPdfError,
  certificatePdfError,
  isPortfolioPdfUploading,
  isCertificatePdfUploading,
  companySummaries,
  isStatsLoading,
  targetCountry,
  targetCountryMarketName,
  selectedVisaOptionId,
  onProgressItemToggle,
  onExpandedStepChange,
  onPortfolioUrlChange,
  onChoosePortfolioPdf,
  onOpenPortfolioPdf,
  onCertificateDraftChange,
  onAddCertificateLink,
  onChooseCertificatePdf,
  onOpenCertificatePdf,
  onLinkedinUrlChange,
  onOpenLinkedinProfile,
  onVisaOptionChange,
}: ProgressTrackerProps) {
  const { t: tProfile } = useTranslation('profile');

  return (
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
        {PROGRESS_CHECKLIST_ITEMS.map((item, index) => {
          const isCompleted = progress.completed[item.id];
          const isExpanded = expandedStepId === item.id;

          return (
            <View
              key={item.id}
              className="rounded-md border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <View className="flex-row items-center">
                <View className="mr-3">
                  <Checkbox
                    value={isCompleted}
                    onChange={() => onProgressItemToggle(item.id)}
                  />
                </View>
                <Pressable
                  onPress={() =>
                    onExpandedStepChange(isExpanded ? null : item.id)
                  }
                  className="flex-1 flex-row items-center"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                >
                  <Text
                    className={`flex-1 text-sm font-medium ${
                      isCompleted
                        ? 'text-gray-500 line-through dark:text-gray-400'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {tProfile('careerAbroad.progress.stepPrefix', {
                      number: index + 1,
                    })}
                    {tProfile(`careerAbroad.progress.steps.${item.labelKey}`)}
                  </Text>
                  <Text className="ml-3 text-lg text-gray-500 dark:text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </Text>
                </Pressable>
              </View>
              {item.id === 'portfolio' && isExpanded && (
                <PortfolioStepDetails
                  progress={progress}
                  portfolioPdfError={portfolioPdfError}
                  isPortfolioPdfUploading={isPortfolioPdfUploading}
                  onPortfolioUrlChange={onPortfolioUrlChange}
                  onChoosePortfolioPdf={onChoosePortfolioPdf}
                  onOpenPortfolioPdf={onOpenPortfolioPdf}
                />
              )}
              {item.id === 'certificate' && isExpanded && (
                <CertificatesStepDetails
                  progress={progress}
                  certificateDraft={certificateDraft}
                  certificatePdfError={certificatePdfError}
                  isCertificatePdfUploading={isCertificatePdfUploading}
                  onCertificateDraftChange={onCertificateDraftChange}
                  onAddCertificateLink={onAddCertificateLink}
                  onChooseCertificatePdf={onChooseCertificatePdf}
                  onOpenCertificatePdf={onOpenCertificatePdf}
                />
              )}
              {item.id === 'linkedin' && isExpanded && (
                <LinkedinStepDetails
                  progress={progress}
                  onLinkedinUrlChange={onLinkedinUrlChange}
                  onOpenLinkedinProfile={onOpenLinkedinProfile}
                />
              )}
              {item.id === 'companies' && isExpanded && (
                <CompaniesStepDetails
                  companySummaries={companySummaries}
                  isStatsLoading={isStatsLoading}
                  targetCountryMarketName={targetCountryMarketName}
                />
              )}
              {item.id === 'visa' && isExpanded && (
                <VisaStepDetails
                  selectedVisaOptionId={selectedVisaOptionId}
                  targetCountry={targetCountry}
                  onVisaOptionChange={onVisaOptionChange}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
