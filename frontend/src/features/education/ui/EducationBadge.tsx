import { Text, View } from 'react-native';

interface EducationBadgeProps {
  value: string;
}

export function EducationBadge({ value }: EducationBadgeProps) {
  return (
    <View
      className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-gray-600 dark:bg-gray-700"
      style={{ maxWidth: '100%' }}
    >
      <Text
        className="text-xs font-semibold text-gray-800 dark:text-gray-100"
        style={{ flexShrink: 1 }}
      >
        {value}
      </Text>
    </View>
  );
}
