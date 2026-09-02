import { useAuthStore } from '@/features/auth/store/auth.store';
import { UserType } from '@/shared/model';
import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';

/** Назад по стеку или на домашний экран выбранного пути, если истории нет. */
export function useExitOrBack() {
  const router = useRouter();
  const userType = useAuthStore((state) => state.user?.userType);

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      const fallback =
        userType === UserType.EMPLOYER
          ? '/employer'
          : userType === UserType.SPECIALIST
            ? '/jobs'
            : '/choose-path';
      router.replace(fallback as Href);
    }
  }, [router, userType]);
}
