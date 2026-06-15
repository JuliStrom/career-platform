import { isAxiosError } from 'axios';

import i18n from '@/shared/config/i18n';

/** Нормализация текста ошибки с бэка (русские строки) для сопоставления с ключами i18n. */
function normalizeBackendErrorText(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Сообщения поля `error` из cp-backend (authController, authMiddleware).
 * Возвращает ключ перевода `auth:errors.*` или null, если неизвестно.
 */
export function mapBackendAuthErrorToKey(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data as
    | { error?: string; message?: string }
    | undefined;
  const raw = data?.error ?? data?.message;
  if (typeof raw !== 'string' || !raw.trim()) return null;

  const n = normalizeBackendErrorText(raw);

  const map: Record<string, string> = {
    'неверный email или пароль': 'errors.invalidCredentials',
    'войдите через google или telegram': 'errors.useOAuthProvider',
    'аккаунт недоступен': 'errors.accountUnavailable',
    'пользователь с таким email уже существует': 'errors.userExists',
    'приглашение не найдено': 'errors.inviteNotFound',
    'приглашение недействительно или истекло': 'invite.invalidInvite',
    'refresh token отсутствует': 'errors.refreshTokenMissing',
    'пользователь не найден': 'errors.userNotFound',
    'пользователь недоступен': 'errors.userUnavailable',
    'refresh token недействителен': 'errors.refreshTokenInvalid',
    'refresh token истек': 'errors.refreshTokenExpired',
    'недействительный google токен': 'errors.googleTokenInvalid',
    'не удалось получить email из google': 'errors.googleEmailMissing',
    'недействительные данные telegram': 'errors.telegramAuthInvalid',
    'данные авторизации устарели': 'errors.authDataStale',
    'токен не предоставлен': 'errors.tokenNotProvided',
    'неверный формат токена': 'errors.tokenFormatInvalid',
  };

  const key = map[n];
  return key ? `auth:${key}` : null;
}

export function resolveAuthFlowErrorMessage(error: unknown): string {
  const mappedKey = mapBackendAuthErrorToKey(error);
  if (mappedKey) return i18n.t(mappedKey);

  if (isAxiosError(error) && !error.response) {
    return i18n.t('common:errors.networkError');
  }

  if (isAxiosError(error) && error.response) {
    const status = error.response.status;
    if (status === 401) return i18n.t('auth:errors.invalidCredentials');
    if (status === 403) return i18n.t('auth:errors.accountUnavailable');
    return i18n.t('auth:errors.unknownError');
  }

  if (error instanceof Error && error.message) return error.message;
  return i18n.t('auth:errors.unknownError');
}
