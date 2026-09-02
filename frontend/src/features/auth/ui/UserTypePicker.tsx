import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { UserType } from '@/shared/model';
import { Pressable, Text, View } from 'react-native';

interface UserTypePickerProps {
  value: UserType | null;
  onSelect: (userType: UserType) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

/** Выбор пути платформы на форме регистрации: работодатель или специалист. */
export function UserTypePicker({
  value,
  onSelect,
  label,
  error,
  disabled = false,
}: UserTypePickerProps) {
  const { t } = useTranslation('auth');

  return (
    <View className="mb-4">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      ) : null}

      <PathCard
        title={t('userTypes.employerTitle')}
        hint={t('userTypes.employerHint')}
        isSelected={value === UserType.EMPLOYER}
        disabled={disabled}
        onPress={() => onSelect(UserType.EMPLOYER)}
      />
      <PathCard
        title={t('userTypes.specialistTitle')}
        hint={t('userTypes.specialistHint')}
        isSelected={value === UserType.SPECIALIST}
        disabled={disabled}
        onPress={() => onSelect(UserType.SPECIALIST)}
      />

      {error ? (
        <Text className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function PathCard({
  title,
  hint,
  isSelected,
  disabled,
  onPress,
}: {
  title: string;
  hint: string;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const stateClassName = isSelected
    ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
    : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      className={`mb-3 rounded-2xl border px-4 py-4 ${stateClassName} ${
        disabled ? 'opacity-60' : ''
      }`}
      style={({ pressed }) =>
        pressed && !disabled ? { opacity: 0.85 } : undefined
      }
    >
      <Text className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300">{hint}</Text>
    </Pressable>
  );
}
