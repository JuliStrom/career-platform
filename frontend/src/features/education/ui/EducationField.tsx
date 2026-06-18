import { Text, View } from 'react-native';

interface EducationFieldProps {
  label: string;
  value: string;
  emptyValue?: string;
}

export function EducationField({
  label,
  value,
  emptyValue,
}: EducationFieldProps) {
  const isFilled = value.trim().length > 0 && value !== emptyValue;

  return (
    <View className="mt-2 flex-row flex-wrap items-center gap-2">
      <Text className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        {label}:
      </Text>
      <View
        className={`rounded-md px-2 py-1 ${
          isFilled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-transparent px-0 py-0'
        }`}
      >
        <Text
          className={`text-sm ${
            isFilled
              ? 'font-semibold text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
