import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from 'react-native';

interface PrimaryButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  isLoading?: boolean;
  textClassName?: string;
}

export function PrimaryButton({
  children,
  isLoading = false,
  onPress,
  disabled,
  accessibilityLabel,
  className,
  textClassName,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled ?? isLoading;
  const buttonClassName = `mb-4 justify-center rounded-lg px-6 py-4 ${
    isDisabled
      ? 'bg-gray-300 dark:bg-gray-700'
      : isLoading
        ? 'bg-blue-400 dark:bg-blue-400/70'
        : 'bg-blue-600 dark:bg-blue-500 hover:opacity-95'
  } ${className ?? ''}`.trim();
  const defaultTextClassName = 'text-center text-base font-semibold text-white';
  const finalTextClassName = textClassName ?? defaultTextClassName;

  return (
    <Pressable
      className={buttonClassName}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) =>
        pressed && !isDisabled ? { opacity: 0.8 } : undefined
      }
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={finalTextClassName}>{children}</Text>
      )}
    </Pressable>
  );
}
