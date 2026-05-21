import { Pressable, Text, View } from 'react-native';

export function ToggleAuthMode(
  isRegister: boolean,
  t: (key: string, options?: Record<string, unknown>) => string,
  onToggleMode: () => void
) {
  return (
    <View className="flex-row justify-center">
      <Text className="text-gray-600 dark:text-gray-400">
        {isRegister ? t('register.hasAccount') : t('login.noAccount')}{' '}
      </Text>
      <Pressable
        onPress={onToggleMode}
        style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
      >
        <Text
          className="font-semibold text-blue-600 dark:text-blue-400"
          accessibilityLabel={
            isRegister
              ? t('accessibility.loginLink')
              : t('accessibility.registerLink')
          }
        >
          {isRegister ? t('register.loginLink') : t('login.registerLink')}
        </Text>
      </Pressable>
    </View>
  );
}
