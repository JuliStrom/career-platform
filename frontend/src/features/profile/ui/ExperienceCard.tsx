import type { Profile } from '@/features/profile/model';
import { formatCurrentPeriod } from '@/features/profile/utils/experience.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { Linking, Pressable, Text, View } from 'react-native';

interface ExperienceCardProps {
  profile: Pick<
    Profile,
    | 'experience'
    | 'workplaces'
    | 'projects'
    | 'careerStartDate'
    | 'currentCompany'
    | 'currentPosition'
    | 'currentAchievement'
  >;
}

function ProjectLines({
  projects,
}: {
  projects: Array<{ name: string; role: string; result: string; link?: string }>;
}) {
  if (!projects.length) return null;
  return (
    <View className="mt-2 pl-2">
      {projects.map((project, index) => (
        <View key={`${project.name}-${index}`} className="mb-2 last:mb-0">
          <Text className="text-sm text-gray-900 dark:text-white">
            {[project.name, project.role].filter(Boolean).join(' · ')}
          </Text>
          {project.result ? (
            <Text className="text-sm leading-5 text-gray-700 dark:text-gray-300">
              {project.result}
            </Text>
          ) : null}
          {project.link ? (
            <Pressable onPress={() => void Linking.openURL(project.link!)}>
              <Text className="text-sm text-blue-600 dark:text-blue-400">
                {project.link}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export const ExperienceCard = ({ profile }: ExperienceCardProps) => {
  const { t } = useTranslation('profile');
  const emptyValue = '—';
  const workplaces = profile.workplaces ?? [];
  const currentProjects = profile.projects ?? [];
  const hasStructured =
    workplaces.length > 0 ||
    currentProjects.length > 0 ||
    Boolean(profile.currentCompany);
  const currentPeriod =
    formatCurrentPeriod(profile.careerStartDate) || emptyValue;

  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('experience')}
      </Text>
      <View
        className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        accessibilityLabel={t('accessibility.experienceLabel')}
      >
        <View className={!hasStructured && profile.experience ? 'mb-4' : ''}>
          <View className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
            <View className="flex-row gap-2 bg-gray-50 px-3 py-2 dark:bg-gray-900">
              <Text className="w-40 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('workplacePeriod')}
              </Text>
              <Text className="min-w-[100px] flex-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('workplaceCompany')}
              </Text>
              <Text className="min-w-[100px] flex-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('workplacePosition')}
              </Text>
              <Text className="min-w-[140px] flex-[1.4] text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('workplaceAchievement')}
              </Text>
            </View>
            {workplaces.map((place, index) => (
              <View
                key={`${place.company}-${place.period}-${index}`}
                className="border-t border-gray-100 px-3 py-2 dark:border-gray-700"
              >
                <View className="flex-row gap-2">
                  <Text className="w-40 text-sm text-gray-900 dark:text-white">
                    {place.period || emptyValue}
                  </Text>
                  <Text className="min-w-[100px] flex-1 text-sm text-gray-900 dark:text-white">
                    {place.company || emptyValue}
                  </Text>
                  <Text className="min-w-[100px] flex-1 text-sm text-gray-900 dark:text-white">
                    {place.position || emptyValue}
                  </Text>
                  <Text className="min-w-[140px] flex-[1.4] text-sm text-gray-800 dark:text-gray-200">
                    {place.achievement || emptyValue}
                  </Text>
                </View>
                <ProjectLines projects={place.projects ?? []} />
              </View>
            ))}
            <View className="border-t border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
              <View className="flex-row gap-2">
                <Text className="w-40 text-sm font-medium text-gray-900 dark:text-white">
                  {currentPeriod}
                </Text>
                <Text className="min-w-[100px] flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  {profile.currentCompany || emptyValue}
                </Text>
                <Text className="min-w-[100px] flex-1 text-sm font-medium text-gray-900 dark:text-white">
                  {profile.currentPosition || emptyValue}
                </Text>
                <Text className="min-w-[140px] flex-[1.4] text-sm font-medium text-gray-900 dark:text-white">
                  {profile.currentAchievement || emptyValue}
                </Text>
              </View>
              <ProjectLines projects={currentProjects} />
            </View>
          </View>
        </View>

        {!hasStructured && profile.experience ? (
          <Text className="text-base leading-6 text-gray-900 dark:text-white">
            {profile.experience}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
