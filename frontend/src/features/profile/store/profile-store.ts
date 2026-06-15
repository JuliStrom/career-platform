import { create } from 'zustand';
import i18n from '@/shared/config/i18n';
import { analytics } from '@/features/analytics/lib/track';
import { useCareerStore } from '@/features/career/store/career-store';
import * as profileApi from '../api/profile.api';
import { Profile } from '../model';

function isLocalAvatarUri(avatar: string | undefined): boolean {
  if (!avatar) return false;
  const trimmed = avatar.trim();
  return (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('assets-library://') ||
    trimmed.startsWith('blob:')
  );
}

/** Дедупликация параллельных fetchProfile (StrictMode, быстрые ремонты экрана). */
let fetchProfileInFlight: Promise<void> | null = null;

export type FetchProfileOptions = {
  /** Принудительно запросить API даже если ответ GET /profile уже был получен */
  force?: boolean;
};

interface ProfileState {
  profile: Profile | null;
  /** true после успешного GET /profile (в т.ч. 404 → null); сброс при logout / resetProfile */
  profileHydrated: boolean;
  isLoading: boolean;
  isDeleting: boolean;
  isDeletingAvatar: boolean;
  error: string | null;

  setProfile: (profile: Profile) => void;
  resetProfile: () => void;
  fetchProfile: (options?: FetchProfileOptions) => Promise<void>;
  createProfile: (body: Profile) => Promise<void>;
  updateProfileApi: (body: Profile) => Promise<void>;
  deleteProfile: () => Promise<void>;
  deleteAvatar: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  profileHydrated: false,
  isLoading: false,
  isDeleting: false,
  isDeletingAvatar: false,
  error: null,
  setProfile: (profile) => set({ profile, error: null, profileHydrated: true }),
  resetProfile: () =>
    set({ profile: null, error: null, profileHydrated: false }),

  fetchProfile: async (options) => {
    const force = options?.force ?? false;
    if (!force && get().profileHydrated) {
      return;
    }

    if (fetchProfileInFlight) {
      return fetchProfileInFlight;
    }

    fetchProfileInFlight = (async () => {
      set({ isLoading: true, error: null });
      try {
        const profile = await profileApi.getProfile();
        if (profile) {
          get().setProfile(profile);
        } else {
          set({
            profile: null,
            error: null,
            profileHydrated: true,
          });
        }
        set({ isLoading: false });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : i18n.t('profile:errors.loadError');
        set({ error: message, isLoading: false });
        throw error;
      } finally {
        fetchProfileInFlight = null;
      }
    })();

    return fetchProfileInFlight;
  },

  createProfile: async (body: Profile) => {
    set({ isLoading: true, error: null });
    try {
      const payload: Profile = { ...body };
      if (isLocalAvatarUri(payload.avatar)) {
        payload.avatar = await profileApi.uploadAvatarFile(payload.avatar!);
      }
      const profile = await profileApi.createProfile(payload);
      get().setProfile(profile);
      void useCareerStore.getState().fetchRecommendations();
      analytics.profileCreated();
      analytics.profileCompleted();
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t('profile:errors.createError');
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  updateProfileApi: async (body: Profile) => {
    set({ isLoading: true, error: null });
    try {
      const payload: Profile = { ...body };
      if (isLocalAvatarUri(payload.avatar)) {
        payload.avatar = await profileApi.uploadAvatarFile(payload.avatar!);
      }
      const profile = await profileApi.updateProfile(payload);
      get().setProfile(profile);
      void useCareerStore.getState().fetchRecommendations();
      analytics.profileUpdated();
      set({ isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t('profile:errors.updateError');
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  deleteProfile: async () => {
    set({ isDeleting: true, error: null });
    try {
      await profileApi.deleteProfile();
      get().resetProfile();
      set({ isDeleting: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t('profile:errors.deleteError');
      set({ error: message, isDeleting: false });
      throw error;
    }
  },
  deleteAvatar: async () => {
    set({ isDeletingAvatar: true, error: null });
    try {
      const profile = await profileApi.deleteAvatar();
      get().setProfile(profile);
      set({ isDeletingAvatar: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t('profile:errors.updateError');
      set({ error: message, isDeletingAvatar: false });
      throw error;
    }
  },
}));
