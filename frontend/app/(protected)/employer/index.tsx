import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { UserType } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { Redirect, router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmployerHomeScreen() {
  const { t } = useTranslation('auth');
  const userType = useAuthStore((state) => state.user?.userType);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!userType) {
    return <Redirect href="/choose-path" />;
  }

  if (userType !== UserType.EMPLOYER) {
    return <Redirect href="/jobs" />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          {t('employerHome.title')}
        </Text>
        <Text className="mb-8 text-base leading-6 text-gray-600 dark:text-gray-300">
          {t('employerHome.subtitle')}
        </Text>

        <View className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/40">
          <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {t('employerHome.project.title')}
          </Text>
          <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300">
            {t('employerHome.project.description')}
          </Text>
        </View>

        <View className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {t('employerHome.specialists.title')}
          </Text>
          <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300">
            {t('employerHome.specialists.description')}
          </Text>
        </View>

        <PrimaryButton
          onPress={handleLogout}
          isLoading={isLoading}
          className="bg-red-500 dark:bg-red-600"
          accessibilityLabel={t('logout.button')}
        >
          {t('logout.button')}
        </PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
}
