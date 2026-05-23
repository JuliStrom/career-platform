import {
  deactivateInvite,
  fetchInvites,
  type Invite,
} from '@/features/admin/api/invites.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import Constants from 'expo-constants';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminInvitesListScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchInvites();
      setInvites(data);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [load]);

  async function handleCopyLink(link: string) {
    await Clipboard.setStringAsync(link);
    Alert.alert('', t('invites.linkCopied'));
  }

  async function performDeactivate(inv: Invite) {
    try {
      await deactivateInvite(inv.id);
      setInvites((prev) => prev.filter((i) => i.id !== inv.id));
    } catch {
      setError(t('errors.networkError'));
    }
  }

  function handleDeactivate(inv: Invite) {
    if (!inv.isActive) return;
    if (Platform.OS === 'web') {
      if (window.confirm(`${t('invites.deactivate')}: ${inv.code}?`)) {
        performDeactivate(inv);
      }
      return;
    }
    Alert.alert(t('invites.deactivate'), `${t('invites.code')}: ${inv.code}`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('invites.deactivate'),
        style: 'destructive',
        onPress: () => performDeactivate(inv),
      },
    ]);
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('adminInvitesTitle')} />
      <View className="flex-1 px-4 pb-4 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('invites.listTitle')}
          </Text>
          <PrimaryButton
            onPress={() => router.push('/admin/invites/create')}
            className="mb-0 px-4 py-2"
          >
            {t('invites.create')}
          </PrimaryButton>
        </View>

        {error && (
          <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
            <Text className="text-sm text-red-700 dark:text-red-300">
              {error}
            </Text>
          </View>
        )}

        <FlatList
          data={invites}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="mt-10 items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  {t('invites.empty')}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <InviteCard
              invite={item}
              onCopyLink={handleCopyLink}
              onDeactivate={handleDeactivate}
              t={t}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function InviteCard({
  invite,
  onCopyLink,
  onDeactivate,
  t,
}: {
  invite: Invite;
  onCopyLink: (link: string) => void;
  onDeactivate: (inv: Invite) => void;
  t: (key: string) => string;
}) {
  const extra = Constants.expoConfig?.extra as { appUrl?: string } | undefined;
  const appUrl =
    (Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : null) ??
    extra?.appUrl ??
    'http://localhost:8081';
  const link = `${appUrl.replace(/\/$/, '')}/register?invite=${invite.code}`;
  return (
    <View className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-base font-semibold text-gray-900 dark:text-white">
          {invite.code}
        </Text>
        {!invite.isActive && (
          <View className="rounded bg-gray-200 px-2 py-0.5 dark:bg-gray-600">
            <Text className="text-xs text-gray-600 dark:text-gray-300">
              {t('invites.inactive')}
            </Text>
          </View>
        )}
      </View>
      <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {t('invites.role')}:{' '}
        {invite.role === 'ADMIN'
          ? t('invites.roleAdmin')
          : t('invites.roleSpecialist')}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        {t('invites.used')}: {invite.usedCount} / {invite.maxUses}
      </Text>
      {invite.expiresAt && (
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {t('invites.expiresAt')}:{' '}
          {new Date(invite.expiresAt).toLocaleDateString()}
        </Text>
      )}
      <View className="mt-3 flex-row gap-2">
        <PrimaryButton
          onPress={() => onCopyLink(link)}
          className="mb-0 flex-1 px-3 py-2"
        >
          {t('invites.copyLink')}
        </PrimaryButton>
        {invite.isActive && (
          <PrimaryButton
            onPress={() => onDeactivate(invite)}
            className="mb-0 flex-1 bg-red-600 px-3 py-2 dark:bg-red-600"
          >
            {t('invites.deactivate')}
          </PrimaryButton>
        )}
      </View>
    </View>
  );
}
