import { secureStorage } from '@/features/auth/lib';
import { API_BASE_URL } from '@/shared/config/api';
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Источник для expo-image: полный URL, локальный URI, или объект с Bearer для прокси /avatars/.
 */
export function useAvatarDisplaySource(
  avatar: string | undefined | null
): string | { uri: string; headers?: Record<string, string> } | null {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token =
        Platform.OS === 'web'
          ? localStorage.getItem('access_token')
          : await secureStorage.getAccessToken();
      if (!cancelled) setAccessToken(token);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    if (!avatar) return null;

    const trimmed = avatar.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('/avatars/')) {
      const uri = `${API_BASE_URL}/profile/avatar/file?v=${encodeURIComponent(trimmed)}`;
      if (!accessToken) return null;
      return {
        uri,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }

    return trimmed;
  }, [accessToken, avatar]);
}
