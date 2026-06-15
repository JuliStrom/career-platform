import { useAuthStore } from '@/features/auth/store/auth.store';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { Redirect, useRootNavigationState } from 'expo-router';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (!rootNavigationState?.key) {
    return <FullScreenLoader />;
  }

  if (isInitializing) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/profile" />;
}
