import { useAuthStore } from '@/features/auth/store/auth.store';
import { useJobsStore } from '@/features/jobs/store';
import { useProfileStore } from '@/features/profile/store/profile-store';
import { AvatarSection } from '@/features/profile/ui/AvatarSection';
import { AiSustainabilityCard } from '@/features/career/ui';
import { CareerGoalSelector } from '@/features/profile/ui/CareerGoalSelector';
import { DirectionLevelBadge } from '@/features/profile/ui/DirectionLevelBadge';
import { ExperienceCard } from '@/features/profile/ui/ExperienceCard';
import { IdentityBlock } from '@/features/profile/ui/IdentityBlock';
import { SkillsTagList } from '@/features/profile/ui/SkillsTagList';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { UserRole } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { FullScreenLoader, LanguageSwitcher } from '@/src/shared/ui';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const resetProfile = useProfileStore((state) => state.resetProfile);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const resetFavorites = useJobsStore((state) => state.resetFavorites);
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  const { t: tProfile } = useTranslation('profile');
  const { t: tJobs } = useTranslation('jobs');
  const { t: tCareer } = useTranslation('career');
  const userRole = useAuthStore((state) => state.user?.role);
  const router = useRouter();
  const [hasTriedFetchProfile, setHasTriedFetchProfile] = useState(false);
  const emptyValue = '—';

  const yearsInCurrentRole = (() => {
    if (!profile?.careerStartDate) return null;
    const startedAt = new Date(profile.careerStartDate);
    if (Number.isNaN(startedAt.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - startedAt.getFullYear();
    const hadAnniversary =
      now.getMonth() > startedAt.getMonth() ||
      (now.getMonth() === startedAt.getMonth() &&
        now.getDate() >= startedAt.getDate());
    if (!hadAnniversary) years -= 1;
    return Math.max(0, years);
  })();

  useEffect(() => {
    if (!isAuthenticated) {
      setHasTriedFetchProfile(false);
      return;
    }
    setHasTriedFetchProfile(false);
    fetchProfile()
      .catch(() => {
        // store already sets error; redirect logic below relies on hasTriedFetchProfile
      })
      .finally(() => setHasTriedFetchProfile(true));
  }, [fetchProfile, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (hasTriedFetchProfile && !isLoading && !profile) {
      router.replace('/profile/create');
    }
  }, [hasTriedFetchProfile, isAuthenticated, isLoading, profile, router]);

  async function handleLogout() {
    resetFavorites();
    resetProfile();
    await logout();
    router.replace('/(auth)/login');
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!profile) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        edges={['top', 'bottom']}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="mb-6 text-center text-lg text-gray-600 dark:text-gray-400"
            accessibilityLabel={tProfile('noProfile')}
          >
            {tProfile('noProfile')}
          </Text>
          <PrimaryButton
            onPress={() => router.push('/profile/create')}
            accessibilityLabel={tProfile('createProfileButton')}
          >
            {tProfile('createProfileButton')}
          </PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        accessibilityLabel={tCommon('appName')}
      >
        <View className="mb-4">
          <LanguageSwitcher />
        </View>
        <AvatarSection avatar={profile.avatar} name={profile.name} />
        <IdentityBlock name={profile.name} />
        <DirectionLevelBadge
          direction={profile.direction}
          level={profile.level}
        />
        <SkillsTagList skills={profile.skills} />
        <ExperienceCard experience={profile.experience} />
        <CareerGoalSelector careerGoal={profile.careerGoal} />
        <AiSustainabilityCard />
        {profile.careerChangeTrackActive ? (
          <PrimaryButton
            onPress={() => router.push('/career-change' as Href)}
            accessibilityLabel={tProfile('careerChange.hubButton')}
            className="mb-4"
          >
            {tProfile('careerChange.hubButton')}
          </PrimaryButton>
        ) : null}
        <View className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {tProfile('specialistDetails')}
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('careerStartDate')}:{' '}
            {profile.careerStartDate
              ? new Date(profile.careerStartDate).toLocaleDateString()
              : emptyValue}
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('currentCompany')}: {profile.currentCompany || emptyValue}
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('city')}:{' '}
            {profile.city ? tProfile(`cities.${profile.city}`) : emptyValue}
          </Text>
          {profile.city === 'abroad' ? (
            <>
              <Text className="text-sm text-gray-900 dark:text-white">
                {tProfile('relocationFromCity')}:{' '}
                {profile.relocationFromCity
                  ? tProfile(`relocationOrigins.${profile.relocationFromCity}`)
                  : emptyValue}
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                {tProfile('relocationToCountry')}:{' '}
                {profile.relocationToCountry
                  ? tProfile(
                      `relocationCountries.${profile.relocationToCountry}`
                    )
                  : emptyValue}
              </Text>
            </>
          ) : null}
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('employmentType')}:{' '}
            {profile.employmentType
              ? tProfile(`employmentTypes.${profile.employmentType}`)
              : emptyValue}
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('profileLang')}:{' '}
            {tProfile(`profileLangs.${profile.lang}`)}
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('wantsRelocation')}:{' '}
            {tProfile(
              `relocationOptions.${profile.wantsRelocation ? 'true' : 'false'}`
            )}
          </Text>
          <Text className="text-sm text-gray-900 dark:text-white">
            {tProfile('yearsInCurrentRole')}: {yearsInCurrentRole ?? emptyValue}
          </Text>
        </View>
        <PrimaryButton
          onPress={() => router.push('/profile/edit')}
          accessibilityLabel={tProfile('editProfileButton')}
          className="mt-6"
        >
          {tProfile('editProfileButton')}
        </PrimaryButton>
        {userRole === UserRole.ADMIN && (
          <PrimaryButton
            onPress={() => router.push('/admin')}
            accessibilityLabel={tCommon('adminPanel')}
            className="mt-3"
          >
            {tCommon('adminPanel')}
          </PrimaryButton>
        )}
        <PrimaryButton
          onPress={() => router.push('/career-abroad')}
          accessibilityLabel={tProfile('careerAbroad.button')}
          className="mt-6"
        >
          {tProfile('careerAbroad.button')}
        </PrimaryButton>
        <PrimaryButton
          onPress={() => router.push('/jobs/favorites')}
          accessibilityLabel={tJobs('favoritesLink')}
          className="mt-3"
        >
          {tJobs('favoritesLink')}
        </PrimaryButton>
        <PrimaryButton
          onPress={() => router.push('/jobs')}
          accessibilityLabel={tJobs('openJobsButton')}
          className="mt-3"
        >
          {tJobs('openJobsButton')}
        </PrimaryButton>
        <PrimaryButton
          onPress={() => router.push('/education' as Href)}
          accessibilityLabel={tCommon('tabEducation')}
          className="mt-3"
        >
          {tCommon('tabEducation')}
        </PrimaryButton>
        <PrimaryButton
          onPress={() => router.push('/recommendations')}
          accessibilityLabel={tCareer('recommendations.title')}
          className="mt-3"
        >
          {tCareer('recommendations.title')}
        </PrimaryButton>
        <PrimaryButton
          onPress={handleLogout}
          isLoading={authIsLoading}
          accessibilityLabel={tAuth('logout.button')}
          className="mt-3 bg-red-500 dark:bg-red-600"
        >
          {tAuth('logout.button')}
        </PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
}
