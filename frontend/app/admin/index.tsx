import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminHomeScreen() {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={tCommon('adminPanel')} showBack={false} />
      <View className="flex-1 px-6 pb-6 pt-4">
        <Text className="mb-6 text-lg text-gray-600 dark:text-gray-400">
          Выберите раздел
        </Text>

        <View className="gap-3">
          <PrimaryButton
            onPress={() => router.push('/admin/invites')}
            className="mt-1"
          >
            {tCommon('adminInvitesTitle')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => router.push('/admin/users')}
            className="mt-1"
          >
            {tCommon('adminUsersTitle')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => router.push('/admin/jobs')}
            className="mt-1"
          >
            {tCommon('adminJobsTitle')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => router.push('/admin/recommendations')}
            className="mt-1"
          >
            {tCommon('adminRecommendationsTitle')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => router.push('/admin/analytics')}
            className="mt-1"
          >
            {tCommon('adminAnalyticsTitle')}
          </PrimaryButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
