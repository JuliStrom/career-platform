import {
  deleteCareerTrigger,
  fetchCareerTriggers,
  type CareerTriggerResource,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCareerTriggersScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [items, setItems] = useState<CareerTriggerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchCareerTriggers());
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
      await deleteCareerTrigger(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch {
      setError(t('errors.networkError'));
    }
  }

  function handleDelete(item: CareerTriggerResource) {
    const message = `${t('adminCareerTriggers.deleteConfirm')}: ${item.triggerTitle}`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) performDelete(item._id);
      return;
    }
    Alert.alert(t('adminCareerTriggers.delete'), message, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('adminCareerTriggers.delete'),
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
      <AdminHeader title={t('adminCareerTriggersTitle')} />
      <View className="flex-1 px-4 pb-4 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('adminCareerTriggers.listTitle')}
          </Text>
          <PrimaryButton
            onPress={() =>
              router.push('/admin/career-triggers/create' as never)
            }
            className="mb-0 px-4 py-2"
          >
            {t('adminCareerTriggers.create')}
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
                {t('adminCareerTriggers.empty')}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                  {item.triggerTitle}
                </Text>
                <Text
                  className={`text-xs font-semibold ${
                    item.isActive ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {item.isActive
                    ? t('adminCareerTriggers.active')
                    : t('adminCareerTriggers.inactive')}
                </Text>
              </View>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {item.specialCase
                  ? t(`adminCareerTriggers.specialCases.${item.specialCase}`)
                  : `${item.direction ?? t('adminCareerTriggers.anyDirection')} · ${item.currentLevel ?? t('adminCareerTriggers.anyLevel')} · ${item.minYears ?? 0} ${t('adminCareerTriggers.years')}`}
              </Text>
              <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {item.triggerDescription}
              </Text>
              <View className="mt-3 flex-row justify-end gap-2">
                <Pressable
                  onPress={() =>
                    router.push(
                      `/admin/career-triggers/${item._id}/edit` as never
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
                    {t('adminCareerTriggers.delete')}
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
