import { VISA_OPTIONS, type VisaOptionId } from '@/features/career/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Linking, Pressable, Text, View } from 'react-native';

interface VisaStepDetailsProps {
  selectedVisaOptionId: VisaOptionId;
  targetCountry: string;
  onVisaOptionChange: (id: VisaOptionId) => void;
}

export function VisaStepDetails({
  selectedVisaOptionId,
  targetCountry,
  onVisaOptionChange,
}: VisaStepDetailsProps) {
  const { t: tProfile } = useTranslation('profile');
  const selectedVisaOption = VISA_OPTIONS.find(
    (option) => option.id === selectedVisaOptionId
  );

  return (
    <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <Text className="mb-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
        {tProfile('careerAbroad.progress.visa.description')}
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {VISA_OPTIONS.map((option) => {
          const isSelected = selectedVisaOptionId === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => onVisaOptionChange(option.id)}
              className={`rounded-md border px-3 py-2 active:opacity-70 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-300 dark:bg-indigo-950'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-200'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {tProfile(
                  `careerAbroad.progress.visa.options.${option.labelKey}`
                )}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selectedVisaOption && (
        <View className="rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            {tProfile(
              `careerAbroad.progress.visa.options.${selectedVisaOption.labelKey}`,
              { targetCountry }
            )}
          </Text>
          <Text className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {tProfile('careerAbroad.progress.visa.costRange', {
              costRange: selectedVisaOption.costRange,
            })}
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {tProfile('careerAbroad.progress.visa.timeline', {
              timeline: selectedVisaOption.timeline,
            })}
          </Text>
          <Text className="mt-3 text-xs leading-4 text-gray-500 dark:text-gray-400">
            {tProfile('careerAbroad.progress.visa.note')}
          </Text>
          {selectedVisaOption.centersUrl && (
            <Pressable
              onPress={() => Linking.openURL(selectedVisaOption.centersUrl)}
              className="mt-3 self-start rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 active:opacity-70 dark:border-indigo-700 dark:bg-indigo-950"
              accessibilityRole="link"
            >
              <Text className="text-sm font-medium text-indigo-700 dark:text-indigo-200">
                {tProfile('careerAbroad.progress.visa.centersLink')}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
