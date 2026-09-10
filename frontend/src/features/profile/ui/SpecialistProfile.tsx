import { AiSustainabilityCard } from '@/features/career/ui';
import type { Profile } from '@/features/profile/model';
import { City } from '@/features/profile/model';
import { AvatarSection } from '@/features/profile/ui/AvatarSection';
import { CareerGoalSelector } from '@/features/profile/ui/CareerGoalSelector';
import { DirectionLevelBadge } from '@/features/profile/ui/DirectionLevelBadge';
import { ExperienceCard } from '@/features/profile/ui/ExperienceCard';
import { SkillsTagList } from '@/features/profile/ui/SkillsTagList';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

interface SpecialistProfileProps {
  profile: Profile;
  onEdit: () => void;
  actions?: ReactNode;
}

export function SpecialistProfile({
  profile,
  onEdit,
  actions,
}: SpecialistProfileProps) {
  const { t } = useTranslation('profile');
  const emptyValue = '—';

  const details = [
    {
      label: t('city'),
      value: profile.city ? t(`cities.${profile.city}`) : emptyValue,
    },
    ...(profile.city === City.Abroad
      ? [
          {
            label: t('relocationFromCity'),
            value: profile.relocationFromCity
              ? t(`relocationOrigins.${profile.relocationFromCity}`)
              : emptyValue,
          },
          {
            label: t('relocationToCountry'),
            value: profile.relocationToCountry
              ? t(`relocationCountries.${profile.relocationToCountry}`)
              : emptyValue,
          },
        ]
      : []),
    {
      label: t('wantsRelocation'),
      value: t(
        `relocationOptions.${profile.wantsRelocation ? 'true' : 'false'}`
      ),
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
    >
      <View className="w-full max-w-3xl self-center">
        <View className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <View className="p-6">
            <Text className="mb-4 text-sm font-medium text-blue-600 dark:text-blue-300">
              {t('title')}
            </Text>
            <View className="flex-row items-center gap-4">
              <AvatarSection
                avatar={profile.avatar}
                name={profile.name}
                className="mb-0 shrink-0"
              />
              <Text
                accessibilityRole="header"
                className="min-w-0 flex-1 text-3xl font-bold text-gray-900 dark:text-white"
              >
                {profile.name}
              </Text>
            </View>
            <View className="mt-6">
              <DirectionLevelBadge
                direction={profile.directions}
                level={profile.level}
              />
            </View>
            <SkillsTagList skills={profile.skills} />
            <ExperienceCard profile={profile} />
            <CareerGoalSelector careerGoal={profile.careerGoal} />
            <View className="mt-2 flex-row flex-wrap gap-3">
              {details.map(({ label, value }) => (
                <View
                  key={label}
                  className="min-w-[140px] flex-1 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900"
                >
                  <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {label}
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className="mt-6">
          <AiSustainabilityCard />
        </View>
        <PrimaryButton
          onPress={onEdit}
          accessibilityLabel={t('editProfileButton')}
          className="mb-0 mt-6"
        >
          {t('editProfileButton')}
        </PrimaryButton>
        {actions}
      </View>
    </ScrollView>
  );
}
