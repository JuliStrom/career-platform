import {
  deleteCareerRoute,
  fetchCareerRoutes,
  type CareerRouteResource,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCareerRoutesScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [items, setItems] = useState<CareerRouteResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchCareerRoutes());
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function performDelete(id: string) {
    try {
      await deleteCareerRoute(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch {
      setError(t('errors.networkError'));
    }
  }

  function handleDelete(item: CareerRouteResource) {
    const message = `${t('adminRoutes.deleteConfirm')}: ${item.title}`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) performDelete(item._id);
      return;
    }
    Alert.alert(t('adminRoutes.delete'), message, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('adminRoutes.delete'),
        style: 'destructive',
        onPress: () => performDelete(item._id),
      },
    ]);
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('adminCareerRoutesTitle')} />
      <View className="flex-1 px-4 pb-4 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('adminRoutes.listTitle')}
          </Text>
          <PrimaryButton
            onPress={() => router.push('/admin/career-routes/create')}
            className="mb-0 px-4 py-2"
          >
            {t('adminRoutes.create')}
          </PrimaryButton>
        </View>
        {error && (
          <Text className="mb-4 text-red-600 dark:text-red-400">{error}</Text>
        )}
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={
            !loading ? (
              <Text className="mt-10 text-center text-gray-500">
                {t('adminRoutes.empty')}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {item.title}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {item.direction} · {item.fromCity || t('adminRoutes.anyCity')} →{' '}
                {item.toCountry}
              </Text>
              {item.isFeatured && (
                <Text className="mt-1 text-xs font-semibold text-blue-600">
                  {t('adminRoutes.featured')}
                </Text>
              )}
              <View className="mt-3 flex-row justify-end gap-2">
                <Pressable
                  onPress={() =>
                    router.push(
                      `/admin/career-routes/${item._id}/edit` as never
                    )
                  }
                  className="rounded-lg bg-blue-600 px-3 py-2"
                >
                  <Text className="font-semibold text-white">{t('edit')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item)}
                  className="rounded-lg bg-red-600 px-3 py-2"
                >
                  <Text className="font-semibold text-white">
                    {t('adminRoutes.delete')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
