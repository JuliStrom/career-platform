import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/** Назад по стеку навигации или переход на профиль, если истории нет. */
export function useExitOrBack() {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  }, [router]);
}
