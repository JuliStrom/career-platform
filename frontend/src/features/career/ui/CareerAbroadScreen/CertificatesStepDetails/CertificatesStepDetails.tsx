import type {
  CareerAbroadProgress,
  CertificateDraft,
} from '@/features/career/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import type { Dispatch, SetStateAction } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

interface CertificatesStepDetailsProps {
  progress: CareerAbroadProgress;
  certificateDraft: CertificateDraft;
  certificatePdfError: string | null;
  isCertificatePdfUploading: boolean;
  onCertificateDraftChange: Dispatch<SetStateAction<CertificateDraft>>;
  onAddCertificateLink: () => void;
  onChooseCertificatePdf: () => void;
  onOpenCertificatePdf: (id: string) => void;
}

export function CertificatesStepDetails({
  progress,
  certificateDraft,
  certificatePdfError,
  isCertificatePdfUploading,
  onCertificateDraftChange,
  onAddCertificateLink,
  onChooseCertificatePdf,
  onOpenCertificatePdf,
}: CertificatesStepDetailsProps) {
  const { t: tProfile } = useTranslation('profile');

  return (
    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
        {tProfile('careerAbroad.progress.certificates.description')}
      </Text>
      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        {tProfile('careerAbroad.progress.certificates.linkLabel')}
      </Text>
      <TextInput
        value={certificateDraft.title}
        onChangeText={(title) =>
          onCertificateDraftChange((current) => ({
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
          onCertificateDraftChange((current) => ({
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
          onCertificateDraftChange((current) => ({
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
        onPress={onAddCertificateLink}
        className="mb-4 self-start rounded-md bg-indigo-600 px-3 py-2 active:opacity-70 dark:bg-indigo-400"
        accessibilityRole="button"
      >
        <Text className="text-sm font-medium text-white dark:text-gray-900">
          {tProfile('careerAbroad.progress.certificates.addLink')}
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
        {tProfile('careerAbroad.progress.certificates.pdfLabel')}
      </Text>
      <Pressable
        onPress={onChooseCertificatePdf}
        disabled={Platform.OS !== 'web' || isCertificatePdfUploading}
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
      <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        {tProfile('careerAbroad.progress.linkedin.recommendationsTitle')}
      </Text>
      <View className="gap-2">
        {progress.certificatePdfs.map((certificate) => (
          <Pressable
            key={certificate._id}
            onPress={() => onOpenCertificatePdf(certificate._id)}
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
            {tProfile('careerAbroad.progress.certificates.emptyPdfs')}
          </Text>
        )}
      </View>
      {certificatePdfError && (
        <Text className="mt-2 text-sm text-red-600 dark:text-red-300">
          {certificatePdfError}
        </Text>
      )}
    </View>
  );
}
