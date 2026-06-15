import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Pressable, Text, View } from 'react-native';

interface ChipSelectorProps<T extends string> {
  label: string;
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  translationKey: string;
  classNameSelector?: string;
  namespace?: string;
}

export function ChipSelector<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  translationKey,
  classNameSelector = 'mb-4',
  namespace = 'profile',
}: ChipSelectorProps<T>) {
  const { t } = useTranslation(namespace);

  return (
    <View className={classNameSelector}>
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              className={`rounded-full px-3 py-1.5 ${
                isSelected
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                className={
                  isSelected
                    ? 'text-sm font-semibold text-white'
                    : 'text-sm text-gray-700 dark:text-gray-300'
                }
              >
                {t(`${translationKey}.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
