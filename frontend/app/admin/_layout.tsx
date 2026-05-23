import { useAuthStore } from '@/features/auth/store/auth.store';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { Redirect, Stack, useRootNavigationState } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AdminLayout() {
  const rootNavigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#f9fafb';

  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!rootNavigationState?.key) {
    return <FullScreenLoader />;
  }

  if (isInitializing || isLoading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'ADMIN') {
    return <Redirect href="/profile" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="invites/index" />
      <Stack.Screen name="invites/create" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="jobs/index" />
      <Stack.Screen name="jobs/create" />
      <Stack.Screen name="jobs/[id]" />
      <Stack.Screen name="jobs/[id]/edit" />
      <Stack.Screen name="recommendations/index" />
      <Stack.Screen name="recommendations/create" />
      <Stack.Screen name="recommendations/[id]" />
      <Stack.Screen name="recommendations/[id]/edit" />
      <Stack.Screen name="analytics/index" />
    </Stack>
  );
}
