import {
  deleteUser,
  fetchUsers,
  updateUserBlock,
  updateUserRole,
  type AdminUser,
  type UserRole,
} from '@/features/admin/api/users.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { handleApiError } from '@/shared/config/api';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminUsersScreen() {
  const { t } = useTranslation('common');
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchUsers({
        page,
        limit: 20,
        role: roleFilter || undefined,
        search: search.trim() || undefined,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
    loadedRef.current = false;
  }, [roleFilter]);

  const performRoleChange = async (user: AdminUser, newRole: UserRole) => {
    setActionLoading(user._id);
    try {
      await updateUserRole(user._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      Alert.alert(t('error'), handleApiError(e));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = (user: AdminUser) => {
    if (user._id === currentUserId) return;
    const newRole: UserRole = user.role === 'ADMIN' ? 'SPECIALIST' : 'ADMIN';
    const roleLabel =
      newRole === 'ADMIN'
        ? t('invites.roleAdmin')
        : t('invites.roleSpecialist');
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${t('users.changeRole')}: ${t('users.roleTo')} ${roleLabel}?`
        )
      ) {
        performRoleChange(user, newRole);
      }
      return;
    }
    Alert.alert(t('users.changeRole'), `${t('users.roleTo')} ${roleLabel}?`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('save'), onPress: () => performRoleChange(user, newRole) },
    ]);
  };

  const performBlockToggle = async (user: AdminUser, newBlocked: boolean) => {
    setActionLoading(user._id);
    try {
      await updateUserBlock(user._id, newBlocked);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isBlocked: newBlocked } : u
        )
      );
    } catch (e) {
      Alert.alert(t('error'), handleApiError(e));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockToggle = (user: AdminUser) => {
    if (user._id === currentUserId) return;
    const newBlocked = !user.isBlocked;
    const action = newBlocked ? t('users.block') : t('users.unblock');
    if (Platform.OS === 'web') {
      if (window.confirm(`${action}: ${user.email}?`)) {
        performBlockToggle(user, newBlocked);
      }
      return;
    }
    Alert.alert(action, user.email, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('save'),
        style: newBlocked ? 'destructive' : undefined,
        onPress: () => performBlockToggle(user, newBlocked),
      },
    ]);
  };

  const performDelete = async (user: AdminUser) => {
    setActionLoading(user._id);
    try {
      await deleteUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (e) {
      Alert.alert(t('error'), handleApiError(e));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (user: AdminUser) => {
    if (user._id === currentUserId) return;
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${t('users.delete')}: ${user.email} — ${t('users.deleteConfirm')}?`
        )
      ) {
        performDelete(user);
      }
      return;
    }
    Alert.alert(
      t('users.delete'),
      `${user.email} вЂ” ${t('users.deleteConfirm')}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('users.delete'),
          style: 'destructive',
          onPress: () => performDelete(user),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('adminUsersTitle')} />
      <View className="flex-1 px-4 pb-4 pt-4">
        <View className="mb-4 flex-row gap-2">
          <TextInput
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder={t('users.searchPlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={load}
          />
          <PrimaryButton onPress={load} className="mb-0 px-4 py-2">
            {t('users.search')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => {
              setRoleFilter(
                roleFilter === ''
                  ? 'ADMIN'
                  : roleFilter === 'ADMIN'
                    ? 'SPECIALIST'
                    : ''
              );
            }}
            className="mb-0 px-4 py-2"
          >
            {roleFilter === ''
              ? t('users.filterAll')
              : roleFilter === 'ADMIN'
                ? t('invites.roleAdmin')
                : t('invites.roleSpecialist')}
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
          data={users}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="mt-10 items-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  {t('users.empty')}
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            total > 0 ? (
              <Text className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {t('users.total')}: {total}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <UserCard
              user={item}
              isCurrentUser={item._id === currentUserId}
              onRoleChange={handleRoleChange}
              onBlockToggle={handleBlockToggle}
              onDelete={handleDelete}
              loading={actionLoading === item._id}
              t={t}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function UserCard({
  user,
  isCurrentUser,
  onRoleChange,
  onBlockToggle,
  onDelete,
  loading,
  t,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  onRoleChange: (u: AdminUser) => void;
  onBlockToggle: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
  loading: boolean;
  t: (key: string) => string;
}) {
  const displayName = user.profile?.name ?? user.email;
  return (
    <View className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white">
            {displayName}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            <View
              className={`rounded px-2 py-0.5 ${user.role === 'ADMIN' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              <Text className="text-xs text-gray-700 dark:text-gray-300">
                {user.role === 'ADMIN'
                  ? t('invites.roleAdmin')
                  : t('invites.roleSpecialist')}
              </Text>
            </View>
            {user.isBlocked && (
              <View className="rounded bg-red-100 px-2 py-0.5 dark:bg-red-900/40">
                <Text className="text-xs text-red-700 dark:text-red-300">
                  {t('users.blocked')}
                </Text>
              </View>
            )}
            {user.isDeleted && (
              <View className="rounded bg-gray-200 px-2 py-0.5 dark:bg-gray-600">
                <Text className="text-xs text-gray-600 dark:text-gray-300">
                  {t('users.deleted')}
                </Text>
              </View>
            )}
          </View>
        </View>
        {loading && <ActivityIndicator size="small" className="ml-2" />}
      </View>
      {!isCurrentUser && !user.isDeleted && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          <PrimaryButton
            onPress={() => onRoleChange(user)}
            className="mb-0 px-3 py-2"
          >
            {t('users.changeRole')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => onBlockToggle(user)}
            className={`mb-0 px-3 py-2 ${user.isBlocked ? 'bg-green-600 dark:bg-green-600' : 'bg-red-600 dark:bg-red-600'}`}
          >
            {user.isBlocked ? t('users.unblock') : t('users.block')}
          </PrimaryButton>
          <PrimaryButton
            onPress={() => onDelete(user)}
            className="mb-0 bg-red-600 px-3 py-2 dark:bg-red-600"
          >
            {t('users.delete')}
          </PrimaryButton>
        </View>
      )}
    </View>
  );
}
