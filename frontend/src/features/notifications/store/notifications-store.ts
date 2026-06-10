import { handleApiError } from '@/shared/config/api';
import { create } from 'zustand';
import * as notificationsApi from '../api/notifications.api';
import type { Notification } from '../model';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  resetNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const { notifications, unreadCount } =
        await notificationsApi.getNotifications();

      set({
        notifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: handleApiError(error),
        isLoading: false,
      });
    }
  },

  markAsRead: async (id) => {
    const notification = get().notifications.find((item) => item._id === id);
    if (!notification || notification.isRead) return;

    try {
      await notificationsApi.markAsRead(id);

      set((state) => ({
        notifications: state.notifications.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        error: null,
      }));
    } catch (error) {
      set({ error: handleApiError(error) });
      throw error;
    }
  },

  markAllAsRead: async () => {
    if (get().unreadCount === 0) return;

    try {
      await notificationsApi.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((item) => ({
          ...item,
          isRead: true,
        })),
        unreadCount: 0,
        error: null,
      }));
    } catch (error) {
      set({ error: handleApiError(error) });
      throw error;
    }
  },

  resetNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    }),
}));
