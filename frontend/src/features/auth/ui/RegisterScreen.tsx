import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as authApi from '../api/auth.api';
import { analytics } from '@/features/analytics/lib/track';
import { AuthForm } from './forms/AuthForm';
import { RegisterWithInviteForm } from './forms/RegisterWithInviteForm';

type InviteState = 'validating' | 'valid' | 'invalid' | 'missing';

export function RegisterScreen() {
  const { t } = useTranslation('auth');
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const [state, setState] = useState<InviteState>('validating');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const code = typeof invite === 'string' ? invite.trim() : null;

    if (!code) {
      setState('missing');
      return;
    }

    let cancelled = false;
    setState('validating');

    authApi
      .validateInvite(code)
      .then((res) => {
        if (cancelled) return;
        if (res.valid) {
          analytics.inviteOpened(code);
          setInviteCode(code);
          setState('valid');
        } else {
          analytics.inviteInvalid(code);
          setState('invalid');
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (code) analytics.inviteInvalid(code);
        setState('invalid');
      });

    return () => {
      cancelled = true;
    };
  }, [invite]);

  if (state === 'validating') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          {t('invite.validating')}
        </Text>
      </SafeAreaView>
    );
  }

  // Обычная регистрация (без invite)
  if (state === 'missing') {
    return <AuthForm mode="register" />;
  }

  if (state === 'invalid') {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="text-base text-red-700 dark:text-red-300">
              {t('invite.invalidInvite')}
            </Text>
          </View>
          <PrimaryButton onPress={() => router.replace('/(auth)/login')}>
            {t('register.loginLink')}
          </PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'valid' && inviteCode) {
    return <RegisterWithInviteForm inviteCode={inviteCode} />;
  }

  return null;
}
