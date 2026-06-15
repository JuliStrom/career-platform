import {
  createInvite,
  type CreateInvitePayload,
} from '@/features/admin/api/invites.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getInviteLink(code: string, apiLink: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/register?invite=${code}`;
  }
  return apiLink;
}

export default function AdminCreateInviteScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [role, setRole] = useState<'SPECIALIST' | 'ADMIN'>('SPECIALIST');
  const [maxUses, setMaxUses] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDateInput = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  }, []);

  const toApiDate = useCallback((str: string): string | undefined => {
    const digits = str.replace(/\D/g, '');
    if (digits.length !== 8) return undefined;
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    return `${year}-${month}-${day}`;
  }, []);

  const handleExpiresAtChange = useCallback(
    (text: string) => setExpiresAt(formatDateInput(text)),
    [formatDateInput]
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ code: string } | null>(null);

  const handleSubmit = async () => {
    const max = parseInt(maxUses, 10);
    if (isNaN(max) || max < 1) {
      setError(t('invites.maxUsesMinError'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: CreateInvitePayload = {
        role,
        accessType: 'INVITE_ONLY',
        maxUses: max,
        expiresAt: expiresAt.trim()
          ? (toApiDate(expiresAt) ?? expiresAt)
          : undefined,
      };
      const { code, link } = await createInvite(payload);
      const linkToCopy = getInviteLink(code, link);
      await Clipboard.setStringAsync(linkToCopy);
      setSuccess({ code });
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('invites.createTitle')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('adminInvitesDescription')}
          </Text>

          {error && (
            <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
              <Text className="text-sm text-red-700 dark:text-red-300">
                {error}
              </Text>
            </View>
          )}

          {success && (
            <View className="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
              <Text className="mb-2 text-base font-semibold text-green-800 dark:text-green-200">
                {t('invites.createdSuccess')}
              </Text>
              <Text className="mb-3 text-sm text-green-700 dark:text-green-300">
                {t('invites.code')}: {success.code}
              </Text>
              <Text className="mb-4 text-sm text-green-700 dark:text-green-300">
                {t('invites.linkCopiedToClipboard')}
              </Text>
              <PrimaryButton
                onPress={() => router.replace('/admin/invites')}
                className="mb-0 bg-green-600 dark:bg-green-600"
              >
                {t('invites.goToList')}
              </PrimaryButton>
            </View>
          )}

          {!success && (
            <>
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('invites.role')}
                </Text>
                <View className="flex-row gap-2">
                  <PrimaryButton
                    onPress={() => setRole('SPECIALIST')}
                    className={`mb-0 flex-1 ${role === 'SPECIALIST' ? '' : 'bg-gray-400 dark:bg-gray-600'}`}
                  >
                    {t('invites.roleSpecialist')}
                  </PrimaryButton>
                  <PrimaryButton
                    onPress={() => setRole('ADMIN')}
                    className={`mb-0 flex-1 ${role === 'ADMIN' ? '' : 'bg-gray-400 dark:bg-gray-600'}`}
                  >
                    {t('invites.roleAdmin')}
                  </PrimaryButton>
                </View>
              </View>

              <NamedField
                label={t('invites.maxUsesLabel')}
                value={maxUses}
                onChangeText={setMaxUses}
                placeholder="1"
                keyboardType="number-pad"
              />

              <NamedField
                label={t('invites.expiresAtLabel')}
                value={expiresAt}
                onChangeText={handleExpiresAtChange}
                placeholder={t('invites.expiresAtPlaceholder')}
                keyboardType="number-pad"
              />

              <View className="mt-6 gap-3">
                <PrimaryButton
                  onPress={handleSubmit}
                  isLoading={loading}
                  disabled={loading}
                >
                  {t('invites.create')}
                </PrimaryButton>
                <PrimaryButton
                  onPress={() => router.replace('/admin/invites')}
                  className="bg-gray-500 dark:bg-gray-600"
                >
                  {t('cancel')}
                </PrimaryButton>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
