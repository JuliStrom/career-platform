import { Pressable, Text } from 'react-native';

interface FilterSecondaryButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  /** С `flex-1` в ряду с PrimaryButton */
  className?: string;
}

/**
 * Вторичная кнопка в блоках фильтров (например «Сбросить»).
 * Визуально согласована с невыбранными чипами: серый фон + тёмный текст, не «disabled».
 */
export function FilterSecondaryButton({
  label,
  onPress,
  accessibilityLabel,
  className = '',
}: FilterSecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className={`mb-0 justify-center rounded-lg border border-gray-300 bg-gray-200 px-6 py-4 active:opacity-90 dark:border-gray-600 dark:bg-gray-700 ${className}`.trim()}
      style={({ pressed }) => (pressed ? { opacity: 0.88 } : undefined)}
    >
      <Text className="text-center text-base font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </Text>
    </Pressable>
  );
}
