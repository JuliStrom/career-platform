import { secureStorage } from '@/features/auth/lib';
import { apiClient } from '@/shared/config/api';
import { Platform } from 'react-native';
import {
  AuthResponse,
  InviteValidationResponse,
  RefreshTokenResponse,
  RegisterWithInvitePayload,
  TelegramAuthPayload,
} from '../model/types';

async function setAccessTokenUniversal(token?: string) {
  if (!token) return;
  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
    return;
  }
  await secureStorage.setAccessToken(token);
}

async function setRefreshTokenUniversal(token?: string) {
  if (!token) return;
  if (Platform.OS === 'web') {
    localStorage.setItem('refresh_token', token);
    return;
  }
  await secureStorage.setRefreshToken(token);
}

async function getRefreshTokenUniversal(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem('refresh_token');
  return secureStorage.getRefreshToken();
}

export async function register(
  payload: RegisterWithInvitePayload | { email: string; password: string }
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    '/auth/register',
    payload
  );
  const { accessToken, refreshToken } = response.data;
  await setAccessTokenUniversal(accessToken);
  await setRefreshTokenUniversal(refreshToken);
  return response.data;
}

export async function validateInvite(
  code: string
): Promise<InviteValidationResponse> {
  const response = await apiClient.get<InviteValidationResponse>(
    `/invites/${encodeURIComponent(code)}`
  );
  return response.data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  const { accessToken, refreshToken } = response.data;
  await setAccessTokenUniversal(accessToken);
  await setRefreshTokenUniversal(refreshToken);

  return response.data;
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  // Secure-by-default: in production backend expects httpOnly cookie.
  // Body fallback is only useful in development when explicitly enabled server-side.
  const refreshToken = await getRefreshTokenUniversal();
  const response = await apiClient.post<RefreshTokenResponse>(
    '/auth/refresh',
    refreshToken ? { refreshToken } : {}
  );
  return response.data;
}

export async function logout(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } else await secureStorage.clearTokens();
  await apiClient.post('/auth/logout', {});
}

/** Вход через Google: отправка id_token от Google Sign-In на бэкенд. inviteCode — для регистрации по приглашению. */
export async function loginWithGoogle(
  idToken: string,
  inviteCode?: string
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/google', {
    idToken,
    ...(inviteCode ? { inviteCode } : {}),
  });
  const { accessToken, refreshToken } = response.data;
  await setAccessTokenUniversal(accessToken);
  await setRefreshTokenUniversal(refreshToken);
  return response.data;
}

/** Вход/регистрация через Telegram. inviteCode — для регистрации по приглашению. */
export async function loginWithTelegram(
  payload: TelegramAuthPayload,
  inviteCode?: string
): Promise<AuthResponse> {
  const body = inviteCode ? { ...payload, inviteCode } : payload;
  const response = await apiClient.post<AuthResponse>('/auth/telegram', body);
  const { accessToken, refreshToken } = response.data;
  await setAccessTokenUniversal(accessToken);
  await setRefreshTokenUniversal(refreshToken);
  return response.data;
}
