import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { usePathname } from 'expo-router';
import { useRef, useEffect, useCallback, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useAuthStore } from '../store/auth.store';
import type { TelegramAuthPayload } from '../model/types';

// Web: Google Identity Services (GIS)
// Native: expo-auth-session (lazy loaded to avoid SSR issues)
WebBrowser.maybeCompleteAuthSession();

interface ExpoExtra {
  googleClientId?: string;
  googleIosClientId?: string;
  googleAndroidClientId?: string;
  telegramBotUsername?: string;
  appUrl?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

/**
 * UI Telegram в формах входа/регистрации скрыт; логика (виджет, loginWithTelegram) сохранена.
 * Чтобы снова показать кнопки — поставьте true.
 */
const SHOW_TELEGRAM_OAUTH_UI = false;

function getGoogleClientIds() {
  const web = extra.googleClientId;
  const ios = extra.googleIosClientId;
  const android = extra.googleAndroidClientId;
  return { web, ios, android };
}

const telegramBotUsername = extra.telegramBotUsername;

interface OAuthButtonsProps {
  /** Код приглашения — для регистрации по invite через Telegram */
  inviteCode?: string;
}

/** Кнопки OAuth: Google (web + native), Telegram (только web). */
export function OAuthButtons({ inviteCode }: OAuthButtonsProps = {}) {
  const { t } = useTranslation('auth');
  const pathname = usePathname();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginWithTelegram = useAuthStore((s) => s.loginWithTelegram);

  const handleTelegramSuccess = useCallback(
    (payload: TelegramAuthPayload) => loginWithTelegram(payload, inviteCode),
    [loginWithTelegram, inviteCode]
  );
  const handleGoogleSuccess = useCallback(
    (idToken: string) => loginWithGoogle(idToken, inviteCode),
    [loginWithGoogle, inviteCode]
  );
  const { web, ios, android } = getGoogleClientIds();

  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const iosExpoGoBlocked = Platform.OS === 'ios' && isExpoGo && Boolean(ios);

  const hasGoogle =
    Platform.OS === 'web'
      ? Boolean(web)
      : Platform.OS === 'ios'
        ? Boolean(ios) && !isExpoGo
        : Boolean(android);

  const appUrl = extra.appUrl ?? 'https://frontend-chi-eight-35.vercel.app';
  const hasTelegram = Boolean(telegramBotUsername);
  const hasTelegramWeb =
    SHOW_TELEGRAM_OAUTH_UI && Platform.OS === 'web' && hasTelegram;
  const hasTelegramNative =
    SHOW_TELEGRAM_OAUTH_UI &&
    hasTelegram &&
    Platform.OS !== 'web' &&
    Boolean(appUrl);

  const placeholderKey = iosExpoGoBlocked
    ? 'oauth.googleExpoGoPlaceholder'
    : Platform.OS === 'android' && !android
      ? 'oauth.googleAndroidPlaceholder'
      : 'oauth.googlePlaceholder';

  const hasAnyOAuth = hasGoogle || hasTelegramWeb || hasTelegramNative;

  if (!hasAnyOAuth || iosExpoGoBlocked) {
    return (
      <View className="mt-6">
        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('oauth.or')}
          </Text>
          <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
        </View>
        <View className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-3 dark:border-gray-600 dark:bg-gray-800/50">
          <Text className="text-base font-medium text-gray-400 dark:text-gray-500">
            {t(placeholderKey)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('oauth.or')}
        </Text>
        <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
      </View>
      <View className="gap-3">
        {hasGoogle &&
          (Platform.OS === 'web' ? (
            <GoogleButtonWeb clientId={web!} onSuccess={handleGoogleSuccess} />
          ) : (
            <GoogleButtonNative
              iosClientId={ios}
              androidClientId={android}
              onSuccess={handleGoogleSuccess}
            />
          ))}
        {hasTelegramWeb && (
          <>
            <TelegramButtonWeb
              botUsername={telegramBotUsername!}
              onSuccess={handleTelegramSuccess}
              pathname={pathname}
            />
            <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
              {t('oauth.telegramHint')}
            </Text>
          </>
        )}
        {hasTelegramNative && (
          <>
            <TelegramButtonNative appUrl={appUrl} inviteCode={inviteCode} />
            <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
              {t('oauth.telegramNativeHint')}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

// --- Web: Google Identity Services ---
function GoogleButtonWeb({
  clientId,
  onSuccess,
}: {
  clientId: string;
  onSuccess: (idToken: string) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  const renderButton = useCallback(
    (container: HTMLDivElement) => {
      if (!clientId || initializedRef.current) return;

      const g = (
        window as unknown as {
          google?: {
            accounts?: {
              id?: {
                initialize: (c: {
                  client_id: string;
                  callback: (r: { credential?: string }) => void;
                }) => void;
                renderButton: (el: HTMLElement, opts: object) => void;
              };
            };
          };
        }
      ).google;

      if (!g?.accounts?.id) return;

      initializedRef.current = true;
      g.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response.credential)
            onSuccess(response.credential).catch(() => {});
        },
      });
      g.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        width: 320,
      });
    },
    [clientId, onSuccess]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryRender = () => {
      const el = containerRef.current;
      if (el) {
        renderButton(el);
        return true;
      }
      return false;
    };

    const win = window as unknown as {
      google?: { accounts?: { id?: unknown } };
    };
    if (win.google?.accounts?.id) {
      tryRender() || requestAnimationFrame(() => tryRender());
    } else {
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existing) {
        const check = () => {
          const g = (
            window as unknown as {
              google?: { accounts?: { id?: unknown } };
            }
          ).google;
          if (g?.accounts?.id) {
            requestAnimationFrame(
              () => tryRender() || setTimeout(tryRender, 50)
            );
          } else {
            setTimeout(check, 50);
          }
        };
        setTimeout(check, 0);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
          requestAnimationFrame(
            () =>
              tryRender() ||
              setTimeout(tryRender, 50) ||
              setTimeout(tryRender, 150)
          );
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      initializedRef.current = false;
    };
  }, [renderButton]);

  const setRef = useCallback(
    (node: unknown) => {
      containerRef.current = node as HTMLDivElement | null;
      if (node && clientId) {
        const g = (
          window as unknown as {
            google?: { accounts?: { id?: unknown } };
          }
        ).google;
        if (g?.accounts?.id) {
          requestAnimationFrame(() => renderButton(node as HTMLDivElement));
        }
      }
    },
    [clientId, renderButton]
  );

  return (
    <View ref={setRef as (node: unknown) => void} style={{ minHeight: 44 }} />
  );
}

// --- Native: expo-auth-session (iOS, Android) ---
function GoogleButtonNative({
  iosClientId,
  androidClientId,
  onSuccess,
}: {
  iosClientId?: string;
  androidClientId?: string;
  onSuccess: (idToken: string) => Promise<void>;
}) {
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);

  const clientId = Platform.OS === 'ios' ? iosClientId : androidClientId;
  const [, response, promptAsync] = useIdTokenAuthRequest({
    webClientId: clientId,
    iosClientId,
    androidClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.params?.id_token ?? response.authentication?.idToken;
      if (idToken) {
        onSuccess(idToken).catch(() => {});
      }
    }
  }, [response, onSuccess]);

  const handlePress = useCallback(async () => {
    setLoading(true);
    try {
      await promptAsync();
    } finally {
      setLoading(false);
    }
  }, [promptAsync]);

  if (!clientId) return null;

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className="min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
    >
      <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
        {loading ? t('loading') : t('oauth.google')}
      </Text>
    </Pressable>
  );
}

// --- Web: Telegram Login Widget ---
const TELEGRAM_CALLBACK = '__telegramAuthCallback';

function TelegramButtonWeb({
  botUsername,
  onSuccess,
  pathname,
}: {
  botUsername: string;
  onSuccess: (payload: TelegramAuthPayload) => Promise<void>;
  pathname?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (typeof window === 'undefined' || !botUsername) return;

    const callback = (user: TelegramAuthPayload) => {
      onSuccessRef.current(user).catch(() => {});
    };

    (window as unknown as Record<string, unknown>)[TELEGRAM_CALLBACK] =
      callback;

    let rafId: number | null = null;
    let cancelled = false;
    let retries = 0;
    const maxRetries = 30;

    const initWidget = () => {
      const container = containerRef.current;
      if (!container) return false;

      container.innerHTML = '';

      const script = document.createElement('script');
      script.src = `https://telegram.org/js/telegram-widget.js?22&_=${Date.now()}`;
      script.async = true;
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', TELEGRAM_CALLBACK);
      script.setAttribute('data-request-access', 'write');

      container.appendChild(script);
      return true;
    };

    const tryInit = () => {
      if (cancelled || retries >= maxRetries) return;
      retries++;
      if (initWidget()) return;
      rafId = requestAnimationFrame(tryInit);
    };

    tryInit();

    return () => {
      cancelled = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      delete (window as unknown as Record<string, unknown>)[TELEGRAM_CALLBACK];
    };
  }, [botUsername, pathname]);

  const setRef = useCallback((node: unknown) => {
    containerRef.current = node as HTMLDivElement | null;
  }, []);

  return (
    <View ref={setRef as (node: unknown) => void} style={{ minHeight: 44 }} />
  );
}

// --- Native: открывает веб-версию в браузере (Telegram Login Widget только на web) ---
function TelegramButtonNative({
  appUrl,
  inviteCode,
}: {
  appUrl: string;
  inviteCode?: string;
}) {
  const { t } = useTranslation('auth');
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    setLoading(true);
    try {
      const base = appUrl.replace(/\/$/, '');
      const path = inviteCode
        ? `/register?invite=${encodeURIComponent(inviteCode)}`
        : '/login';
      await WebBrowser.openBrowserAsync(`${base}${path}`);
    } finally {
      setLoading(false);
    }
  }, [appUrl, inviteCode]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className="min-h-[44px] items-center justify-center rounded-xl border border-[#0088cc] bg-[#0088cc]/10 dark:border-[#0088cc] dark:bg-[#0088cc]/20"
    >
      <Text className="text-base font-medium text-[#0088cc]">
        {loading ? t('loading') : t('oauth.telegram')}
      </Text>
    </Pressable>
  );
}
