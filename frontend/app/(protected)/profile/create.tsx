import { Profile } from '@/features/profile/model';
import { ProfileForm } from '@/features/profile/ui/ProfileForm';
import { useProfileStore } from '@/features/profile/store/profile-store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { useRouter } from 'expo-router';

export default function CreateProfileScreen() {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const createProfile = useProfileStore((state) => state.createProfile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const error = useProfileStore((state) => state.error);

  const handleSubmit = async (values: Profile) => {
    try {
      await createProfile(values);
      router.replace('/profile');
    } catch {
      // Ошибка обрабатывается в store и отображается через error prop
    }
  };

  return (
    <ProfileForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      submitButtonText={t('createProfileButton')}
      submitButtonLabel={t('createProfileButton')}
      title={t('createProfile')}
    />
  );
}
