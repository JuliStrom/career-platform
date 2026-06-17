import {
  deleteCompany,
  fetchCompanies,
  type CompanyResource,
} from '@/features/admin/api/resources.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCompaniesScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [items, setItems] = useState<CompanyResource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        setItems(await fetchCompanies(query.trim()));
      } catch {
        setError(t('errors.networkError'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    load('');
  }, [load]);

  async function performDelete(id: string) {
    try {
      await deleteCompany(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch {
      setError(t('errors.networkError'));
    }
  }

  function handleDelete(item: CompanyResource) {
    const message = `${t('adminCompanies.deleteConfirm')}: ${item.name}`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) performDelete(item._id);
      return;
    }
    Alert.alert(t('adminCompanies.delete'), message, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('adminCompanies.delete'),
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
      <AdminHeader title={t('adminCompaniesTitle')} />
      <View className="flex-1 px-4 pb-4 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('adminCompanies.listTitle')}
          </Text>
          <PrimaryButton
            onPress={() => router.push('/admin/companies/create')}
            className="mb-0 px-4 py-2"
          >
            {t('adminCompanies.create')}
          </PrimaryButton>
        </View>
        <View className="mb-4 flex-row items-end gap-2">
          <View className="flex-1">
            <NamedField
              label={t('adminCompanies.search')}
              value={search}
              onChangeText={setSearch}
              margin="mb-0"
            />
          </View>
          <PrimaryButton
            onPress={() => load(search)}
            isLoading={loading}
            className="mb-0 px-4 py-3"
          >
            {t('users.search')}
          </PrimaryButton>
        </View>
        {error && (
          <Text className="mb-4 text-red-600 dark:text-red-400">{error}</Text>
        )}
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={() => load(search)}
          ListEmptyComponent={
            !loading ? (
              <Text className="mt-10 text-center text-gray-500">
                {t('adminCompanies.empty')}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {item.name}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {item.workFormat} · {item.teamSize} ·{' '}
                {item.languages.join(', ')}
              </Text>
              <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </Text>
              <View className="mt-3 flex-row justify-end gap-2">
                <Pressable
                  onPress={() =>
                    router.push(`/admin/companies/${item._id}/edit` as never)
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
                    {t('adminCompanies.delete')}
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
