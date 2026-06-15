import type { Notification } from '@/features/notifications/model';
import { formatNotificationPayload } from '@/features/notifications/lib/formatNotificationPayload';
import { useNotificationsStore } from '@/features/notifications/store/notifications-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation('notifications');
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const fetchNotifications = useNotificationsStore(
    (state) => state.fetchNotifications
  );
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  async function handleNotificationPress(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const route = notification.payload.route;
    if (typeof route === 'string' && route.startsWith('/')) {
      router.push(route as Href);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </Text>
        {unreadCount > 0 && (
          <Pressable onPress={() => void markAllAsRead()}>
            <Text className="font-medium text-blue-600 dark:text-blue-400">
              {t('markAllAsRead')}
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void fetchNotifications()}
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? { flexGrow: 1 } : undefined
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-3 p-8">
              <MaterialIcons
                name="notifications-none"
                size={48}
                color="#9ca3af"
              />
              <Text className="text-center text-gray-500 dark:text-gray-400">
                {t('empty')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => void handleNotificationPress(item)}
              className={`border-b border-gray-200 p-5 dark:border-gray-700 ${
                item.isRead
                  ? 'bg-white dark:bg-gray-900'
                  : 'bg-blue-50 dark:bg-blue-950'
              }`}
            >
              <View className="flex-row items-start gap-3">
                {!item.isRead && (
                  <View className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                )}
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    {t(`types.${item.type}.title`)}
                  </Text>
                  <Text className="mt-1 leading-5 text-gray-600 dark:text-gray-300">
                    {t(
                      `types.${item.type}.message`,
                      formatNotificationPayload(
                        item.type,
                        item.payload,
                        currentLanguage
                      )
                    )}
                  </Text>
                  <Text className="mt-2 text-xs text-gray-400">
                    {new Date(item.sentAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
