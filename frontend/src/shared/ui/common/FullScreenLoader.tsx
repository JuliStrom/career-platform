import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function FullScreenLoader({ message }: { message?: string }) {
  const { t } = useTranslation('common');
  const displayMessage = message ?? t('loading');
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <View className="items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          {displayMessage}
        </Text>
      </View>
    </SafeAreaView>
  );
}
