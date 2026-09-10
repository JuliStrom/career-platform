import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Pressable, Text, View } from 'react-native';

interface ChipSelectorProps<T extends string> {
  label: string;
  options: readonly T[];
  selectedValue?: T;
  selectedValues?: T[];
  onSelect: (value: T) => void;
  translationKey: string;
  classNameSelector?: string;
  namespace?: string;
  maxSelected?: number;
  hint?: string;
}

export function ChipSelector<T extends string>({
  label,
  options,
  selectedValue,
  selectedValues,
  onSelect,
  translationKey,
  classNameSelector = 'mb-4',
  namespace = 'profile',
  maxSelected,
  hint,
}: ChipSelectorProps<T>) {
  const { t } = useTranslation(namespace);
  const isMulti = selectedValues != null;

  return (
    <View className={classNameSelector}>
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      {hint ? (
        <Text className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = isMulti
            ? selectedValues.includes(option)
            : selectedValue === option;
          const atLimit =
            isMulti &&
            maxSelected != null &&
            selectedValues.length >= maxSelected &&
            !isSelected;

          return (
            <Pressable
              key={option}
              onPress={() => {
                if (atLimit) return;
                onSelect(option);
              }}
              disabled={atLimit}
              className={`rounded-full px-3 py-1.5 ${
                isSelected
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : atLimit
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-gray-200 dark:bg-gray-700'
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: atLimit }}
            >
              <Text
                className={
                  isSelected
                    ? 'text-sm font-semibold text-white'
                    : atLimit
                      ? 'text-sm text-gray-400 dark:text-gray-500'
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
