import {
  PORTFOLIO_RESOURCES,
  type CareerAbroadProgress,
} from '@/features/career/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import {
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

interface PortfolioStepDetailsProps {
  progress: CareerAbroadProgress;
  portfolioPdfError: string | null;
  isPortfolioPdfUploading: boolean;
  onPortfolioUrlChange: (portfolioUrl: string) => void;
  onChoosePortfolioPdf: () => void;
  onOpenPortfolioPdf: () => void;
}

export function PortfolioStepDetails({
  progress,
  portfolioPdfError,
  isPortfolioPdfUploading,
  onPortfolioUrlChange,
  onChoosePortfolioPdf,
  onOpenPortfolioPdf,
}: PortfolioStepDetailsProps) {
  const { t: tProfile } = useTranslation('profile');

  return (
    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
        {tProfile('careerAbroad.progress.portfolio.description')}
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
        onChangeText={onPortfolioUrlChange}
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
          onPress={onOpenPortfolioPdf}
          disabled={!progress.portfolioPdfName}
          className="mr-3 flex-1"
          accessibilityRole={progress.portfolioPdfName ? 'link' : undefined}
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
          onPress={onChoosePortfolioPdf}
          disabled={Platform.OS !== 'web' || isPortfolioPdfUploading}
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
  );
}
