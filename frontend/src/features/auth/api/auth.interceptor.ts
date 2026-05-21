import { secureStorage } from '@/features/auth/lib';
import { apiClient } from '@/shared/config/api';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import {
  applyAccessTokenUpdate,
  applyAuthRefreshFailure,
} from '../store/auth.store';
import * as authApi from './auth.api';

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
}

async function getAccessTokenUniversal() {
  if (Platform.OS === 'web') return localStorage.getItem('access_token');
  return secureStorage.getAccessToken();
}

async function setAccessTokenUniversal(token?: string) {
  if (!token) return;
  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
    return;
  }
  await secureStorage.setAccessToken(token);
}

async function clearTokensUniversal() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
    return;
  }
  await secureStorage.clearTokens();
}

export function setupAuthInterceptors() {
  const requestInterceptorId = apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await getAccessTokenUniversal();

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  const responseInterceptorId = apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const isRefreshUrl = originalRequest.url?.includes('/auth/refresh');

      if (isRefreshUrl && error.response?.status === 401) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await authApi.refreshToken();
          const newAccessToken = response.accessToken;
          if (newAccessToken) {
            await setAccessTokenUniversal(newAccessToken);
            await applyAccessTokenUpdate(newAccessToken);
            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken ?? null);
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          await clearTokensUniversal();
          await applyAuthRefreshFailure();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return () => {
    apiClient.interceptors.request.eject(requestInterceptorId);
    apiClient.interceptors.response.eject(responseInterceptorId);
  };
}
