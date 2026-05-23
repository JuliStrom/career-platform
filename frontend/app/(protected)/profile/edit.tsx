import { Profile } from '@/features/profile/model';
import { useProfileStore } from '@/features/profile/store/profile-store';
import { ProfileForm } from '@/features/profile/ui/ProfileForm';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform, View } from 'react-native';

export default function EditProfileScreen() {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const updateProfileApi = useProfileStore((state) => state.updateProfileApi);
  const deleteProfile = useProfileStore((state) => state.deleteProfile);
  const deleteAvatar = useProfileStore((state) => state.deleteAvatar);
  const isLoading = useProfileStore((state) => state.isLoading);
  const isDeleting = useProfileStore((state) => state.isDeleting);
  const isDeletingAvatar = useProfileStore((state) => state.isDeletingAvatar);
  const error = useProfileStore((state) => state.error);

  useEffect(() => {
    if (!profile) {
      router.replace('/profile');
    }
  }, [profile, router]);

  const handleSubmit = async (values: Profile) => {
    try {
      await updateProfileApi(values);
      router.replace('/profile');
    } catch {
      // Ошибка обрабатывается в store и отображается через error prop
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
    } catch {
      // Ошибка обрабатывается в store
    }
  };

  async function performDelete() {
    try {
      await deleteProfile();
      router.replace('/profile');
    } catch {
      // Ошибка обрабатывается в store и отображается через error prop
    }
  }

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${t('deleteConfirmTitle')}: ${t('deleteConfirmMessage')}?`
        )
      ) {
        performDelete();
      }
      return;
    }
    Alert.alert(
      t('deleteConfirmTitle'),
      t('deleteConfirmMessage'),
      [
        { text: t('deleteConfirmCancel'), style: 'cancel' },
        {
          text: t('deleteConfirmDelete'),
          style: 'destructive',
          onPress: () => performDelete(),
        },
      ],
      { cancelable: true }
    );
  };

  if (!profile) {
    return null;
  }

  return (
    <View
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      style={{
        pointerEvents: isDeleting || isDeletingAvatar ? 'none' : 'auto',
      }}
    >
      <ProfileForm
        initialValues={profile}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitButtonText={t('updateProfileButton')}
        submitButtonLabel={t('updateProfileButton')}
        title={t('editProfile')}
        showCancelButton
        onCancel={handleCancel}
        cancelButtonText={t('cancel')}
        onDeleteAvatar={handleDeleteAvatar}
        isDeletingAvatar={isDeletingAvatar}
      />
      <View className="px-6 pb-6">
        <PrimaryButton
          onPress={handleDelete}
          disabled={isDeleting || isLoading}
          isLoading={isDeleting}
          accessibilityLabel={t('deleteProfile')}
          className="bg-red-500 dark:bg-red-600"
          textClassName="text-center text-base font-semibold text-white"
        >
          {t('deleteProfileButton')}
        </PrimaryButton>
      </View>
    </View>
  );
}
