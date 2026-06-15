import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { Checkbox } from '@/shared/ui/checkbox/Checkbox';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthForm } from '../../hooks/use-auth-form';
import type {
  AuthFormValues,
  AuthMode,
  LoginFormData,
  RegisterBasicFormData,
} from '../../model';
import { useAuthStore } from '../../store/auth.store';
import { LanguageSwitcher } from '@/shared/ui';
import { OAuthButtons } from '../OAuthButtons';
import { BaseAuthFields } from './BaseAuthFields';
import { RegisterExtraFields } from './RegisterExtraFields';
import { ToggleAuthMode } from './ToggleAuthMode';

interface AuthFormProps {
  mode: AuthMode;
}

/** Смена языка пересоздаёт форму — Zod-сообщения берутся из актуальной локали. */
export function AuthForm({ mode }: AuthFormProps) {
  const { currentLanguage } = useTranslation('auth');
  return <AuthFormInner key={`${mode}-${currentLanguage}`} mode={mode} />;
}

function AuthFormInner({ mode }: AuthFormProps) {
  const { t } = useTranslation('auth');
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearError = useAuthStore((state) => state.clearError);

  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit: rhfHandleSubmit,
    isRegister,
    getSubmitPayload,
    privacyAccepted,
    setPrivacyAccepted,
    pathname,
  } = useAuthForm({ mode });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/profile');
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    clearError();
    setLocalError(null);
    setPrivacyAccepted(false);
    return () => {
      clearError();
      setLocalError(null);
    };
  }, [mode, clearError, setPrivacyAccepted]);

  const handleSubmit = async (data: AuthFormValues) => {
    setLocalError(null);
    clearError();

    try {
      if (mode === 'login') {
        await login(getSubmitPayload(data) as LoginFormData);
      } else {
        const { email, password } = getSubmitPayload(
          data
        ) as RegisterBasicFormData;
        await register({ email, password });
      }
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : t('errors.unknownError')
      );
    }
  };

  const handleToggleMode = () => {
    clearError();
    setLocalError(null);
    router.push(mode === 'login' ? '/(auth)/register' : '/(auth)/login');
  };

  const error = authError || localError;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-4 self-end">
            <LanguageSwitcher />
          </View>
          <View
            className="mb-8"
            accessibilityRole="header"
            accessibilityLabel={
              isRegister
                ? t('accessibility.registerLabel')
                : t('accessibility.loginLabel')
            }
          >
            <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isRegister ? t('register.title') : t('login.title')}
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400">
              {isRegister ? t('register.subtitle') : t('login.subtitle')}
            </Text>
          </View>

          {error && (
            <View className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <Text className="text-sm text-red-600 dark:text-red-400">
                {error}
              </Text>
            </View>
          )}

          {Object.keys(errors).length > 0 && (
            <View className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <Text className="text-sm text-amber-800 dark:text-amber-200">
                {t('validation.checkFields')}
              </Text>
            </View>
          )}

          <BaseAuthFields t={t} control={control} errors={errors} />

          {isRegister && (
            <>
              <RegisterExtraFields
                t={t}
                control={control as Control<RegisterBasicFormData>}
                errors={errors as FieldErrors<RegisterBasicFormData>}
              />
              <View className="mb-4 mt-4 flex-row items-start">
                <Checkbox
                  value={privacyAccepted}
                  onChange={setPrivacyAccepted}
                />
                <Text className="ml-3 flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {t('privacy.agree')}
                  <Text
                    className="text-blue-600 dark:text-blue-400"
                    onPress={() =>
                      router.push({
                        pathname: '/privacy-policy',
                        params: { from: pathname },
                      })
                    }
                  >
                    {t('privacy.policy')}
                  </Text>
                  {t('privacy.and')}
                  <Text
                    className="text-blue-600 dark:text-blue-400"
                    onPress={() =>
                      router.push({
                        pathname: '/terms-of-service',
                        params: { from: pathname },
                      })
                    }
                  >
                    {t('privacy.terms')}
                  </Text>
                </Text>
              </View>
            </>
          )}

          {isRegister && !privacyAccepted && (
            <Text className="mb-3 text-sm text-amber-600 dark:text-amber-400">
              {t('privacy.requiredHint')}
            </Text>
          )}
          <PrimaryButton
            onPress={rhfHandleSubmit(handleSubmit)}
            isLoading={isLoading}
            disabled={isRegister && !privacyAccepted}
            accessibilityLabel={t('accessibility.submitButton')}
          >
            {isRegister ? t('register.submit') : t('login.submit')}
          </PrimaryButton>

          <OAuthButtons />

          {ToggleAuthMode(isRegister, t, handleToggleMode)}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
