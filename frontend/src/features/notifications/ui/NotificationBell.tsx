import type { Notification } from '@/features/notifications/model';
import { formatNotificationPayload } from '@/features/notifications/lib/formatNotificationPayload';
import { useNotificationsStore } from '@/features/notifications/store/notifications-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

export function NotificationBell() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const popoverWidth = Math.min(320, windowWidth - 32);

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

  async function handleOpen() {
    setIsOpen(true);
    await fetchNotifications();
  }

  async function handleNotificationPress(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setIsOpen(false);

    const route = notification.payload.route;
    if (typeof route === 'string' && route.startsWith('/')) {
      router.push(route as Href);
    }
  }

  return (
    <>
      <Pressable
        onPress={handleOpen}
        className="relative rounded-full p-2 active:bg-gray-200 dark:active:bg-gray-700"
        accessibilityRole="button"
        accessibilityLabel={t('open')}
      >
        <MaterialIcons
          name={unreadCount > 0 ? 'notifications' : 'notifications-none'}
          size={28}
          color={unreadCount > 0 ? '#2563eb' : '#000000'}
        />

        {unreadCount > 0 && (
          <View className="absolute right-0 top-0 min-w-5 items-center rounded-full bg-red-500 px-1">
            <Text className="text-xs font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="absolute max-h-[70%] overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{
              top: 64,
              left: windowWidth - popoverWidth - 16,
              width: popoverWidth,
              padding: 10,
            }}
            onPress={(event) => event.stopPropagation()}
          >
            {isLoading && notifications.length === 0 ? (
              <View className="flex-row items-center justify-center p-5">
                <ActivityIndicator size="small" color="#2563eb" />
                <CloseButton
                  onPress={() => setIsOpen(false)}
                  label={t('close')}
                />
              </View>
            ) : notifications.length === 0 ? (
              <View className="flex-row items-center justify-between gap-4 p-5">
                <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                  {t('empty')}
                </Text>
                <Pressable
                  onPress={() => setIsOpen(false)}
                  className="rounded-full p-1 active:bg-gray-100 dark:active:bg-gray-700"
                  accessibilityLabel={t('close')}
                >
                  <MaterialIcons name="close" size={22} color="#6b7280" />
                </Pressable>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('title')}
                  </Text>

                  <View className="flex-row items-center gap-3">
                    {unreadCount > 0 && (
                      <Pressable onPress={markAllAsRead}>
                        <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {t('markAllAsRead')}
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => setIsOpen(false)}
                      className="rounded-full p-1 active:bg-gray-100 dark:active:bg-gray-700"
                      accessibilityLabel={t('close')}
                    >
                      <MaterialIcons name="close" size={22} color="#6b7280" />
                    </Pressable>
                  </View>
                </View>

                <FlatList
                  data={notifications}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleNotificationPress(item)}
                      className={`border-b border-gray-100 p-4 dark:border-gray-700 ${
                        item.isRead
                          ? 'bg-white dark:bg-gray-800'
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
                          <Text className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-300">
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
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface CloseButtonProps {
  onPress: () => void;
  label: string;
}

function CloseButton({ onPress, label }: CloseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute right-4 rounded-full p-1 active:bg-gray-100 dark:active:bg-gray-700"
      accessibilityLabel={label}
    >
      <MaterialIcons name="close" size={22} color="#6b7280" />
    </Pressable>
  );
}
