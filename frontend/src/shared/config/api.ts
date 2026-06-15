import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import i18n from './i18n';

export interface ExpoExtra {
  apiUrlDefault?: string;
  apiUrlAndroidEmulator?: string;
  apiUrlWeb?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

const DEFAULT_WEB_API = 'http://localhost:3000/api';

/**
 * Убирает ошибочные суффиксы `/api/jobs`, `/api/profile` (когда в env попал путь SPA
 * из адресной строки вместо корня API). Axios склеивает baseURL + `/jobs` → `.../api/jobs/jobs`.
 */
function normalizeApiRoot(url: string): string {
  let u = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(u)) return u;
  // Частые ошибки: в env попал путь SPA (/jobs, /profile, /recommendations, /admin)
  const mistaken = /\/api\/(jobs|profile|recommendations|admin)$/i;
  while (mistaken.test(u)) {
    u = u.replace(mistaken, '/api');
  }
  return u;
}

function ensureAbsoluteUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return DEFAULT_WEB_API;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const normalized = normalizeApiRoot(trimmed);
    if (normalized !== trimmed) {
      console.warn(
        '[api] API URL исправлен: в EXPO_PUBLIC_API_URL_WEB / API_URL_WEB должен быть только корень с /api (без /jobs, /profile и т.д.). Было:',
        trimmed,
        '→',
        normalized
      );
    }
    return normalized;
  }
  return DEFAULT_WEB_API;
}

function getApiUrl(): string {
  const isAndroidEmulator =
    __DEV__ && Platform.OS === 'android' && !Device.isDevice;

  if (isAndroidEmulator && extra.apiUrlAndroidEmulator) {
    return (
      ensureAbsoluteUrl(extra.apiUrlAndroidEmulator) ||
      'http://10.0.2.2:3000/api'
    );
  }

  if (Platform.OS === 'web') {
    return ensureAbsoluteUrl(extra.apiUrlWeb) || DEFAULT_WEB_API;
  }

  return (
    ensureAbsoluteUrl(extra.apiUrlDefault) || 'http://192.168.2.100:3000/api'
  );
}

const API_URL = getApiUrl();
if (__DEV__) console.log('Resolved API_URL:', API_URL);
// Debug: в DevTools Console можно проверить window.__API_BASE_URL__
if (typeof window !== 'undefined') {
  (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__ =
    API_URL;
}

// На web перепроверяем baseURL, чтобы избежать относительных путей (запрос на origin вместо API)
const baseURL =
  typeof window !== 'undefined' && !API_URL.startsWith('http')
    ? DEFAULT_WEB_API
    : API_URL;

export const API_BASE_URL = baseURL;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      details?: { field: string; message: string }[];
    }>;

    if (!axiosError.response) {
      return i18n.t('common:errors.networkError');
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    if (data?.message) return data.message;
    if (data?.error) {
      const details = data?.details;
      if (Array.isArray(details) && details.length > 0) {
        const fieldMessages = details
          .map((d) => {
            const field = d.field.replace(/^body\./, '');
            return `${field}: ${d.message}`;
          })
          .join('; ');
        return `${data.error}: ${fieldMessages}`;
      }
      return data.error;
    }

    switch (status) {
      case 401:
        return i18n.t('common:errors.unauthorized');
      default:
        return i18n.t('common:errors.unknownError');
    }
  }

  if (error instanceof Error) return error.message;
  return i18n.t('common:errors.unknownError');
}
