import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface NamedFieldProps extends TextInputProps {
  error?: string;
  touched?: boolean;
  label: string;
  margin?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

const defaultLabelClassName =
  'mb-2 text-sm font-medium text-gray-700 dark:text-gray-300';
const defaultInputClassName =
  'rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white';
const defaultErrorClassName = 'mt-1 text-sm text-red-600 dark:text-red-400';

export function NamedField({
  error,
  touched,
  label,
  nativeID,
  margin = 'mb-4',
  labelClassName = defaultLabelClassName,
  inputClassName = defaultInputClassName,
  errorClassName = defaultErrorClassName,
  placeholderTextColor = '#9CA3AF',
  ...props
}: NamedFieldProps) {
  return (
    <View className={margin}>
      {label && (
        <Text
          className={labelClassName}
          nativeID={nativeID}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
      <TextInput
        className={inputClassName}
        placeholderTextColor={placeholderTextColor}
        accessibilityLabelledBy={nativeID}
        {...props}
      />
      {error && <Text className={errorClassName}>{error}</Text>}
    </View>
  );
}
