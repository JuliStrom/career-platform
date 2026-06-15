import { analytics } from '@/features/analytics/lib/track';
import { useCareerStore } from '@/features/career/store';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { IconNavPressable } from '@/src/shared/ui';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatEstimatedTime(
  minMonths: number,
  maxMonths: number | null
): string {
  if (
    typeof maxMonths === 'number' &&
    Number.isFinite(maxMonths) &&
    maxMonths > minMonths
  ) {
    return `${minMonths}-${maxMonths}`;
  }
  return String(minMonths);
}

export default function CareerRoadmapScreen() {
  const router = useRouter();
  const { t } = useTranslation('career');
  const { roadmap, isLoadingRoadmap, error, fetchCareerRoadmap } =
    useCareerStore();

  useEffect(() => {
    analytics.careerRoadmapOpened();
    fetchCareerRoadmap();
  }, [fetchCareerRoadmap]);

  if (isLoadingRoadmap && !roadmap) {
    return <FullScreenLoader message={t('roadmap.loading')} />;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <View className="flex-row items-center gap-3 px-6 pt-6">
        <IconNavPressable
          name="arrow-back"
          accessibilityLabel={t('recommendations.goBack')}
          onPress={() => router.replace('/recommendations')}
        />
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('roadmap.title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 16 }}
      >
        {error ? (
          <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
            <Text className="text-sm text-red-700 dark:text-red-300">
              {error}
            </Text>
          </View>
        ) : null}

        {!roadmap || roadmap.roadmaps.length === 0 ? (
          <Text className="text-center text-sm text-gray-600 dark:text-gray-300">
            {t('roadmap.empty')}
          </Text>
        ) : (
          <View className="gap-4">
            {roadmap.roadmaps.map((item) => (
              <View
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <Text className="mb-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  {t(`roadmap.branchType.${item.branchType}`)}
                </Text>
                <Text className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {item.fromLevel} → {item.toLevel}
                </Text>
                <Text className="mb-3 text-sm text-gray-700 dark:text-gray-200">
                  {t('roadmap.nextRole')}: {item.toRole}
                </Text>

                <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {t('roadmap.skillsToDevelop')}
                </Text>
                <View className="mb-3 flex-row flex-wrap gap-2">
                  {item.skillsToDevelop.map((skill) => (
                    <View
                      key={skill}
                      className="rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900/40"
                    >
                      <Text className="text-xs font-medium text-blue-900 dark:text-blue-200">
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text className="mb-3 text-sm text-gray-700 dark:text-gray-200">
                  {t('roadmap.estimatedTime')}:{' '}
                  {formatEstimatedTime(
                    item.estimatedTimeMonths,
                    item.estimatedTimeMonthsMax
                  )}{' '}
                  {t('roadmap.months')}
                </Text>

                {item.careerBranches.length > 0 ? (
                  <>
                    <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('roadmap.careerBranches')}
                    </Text>
                    <Text className="mb-3 text-sm text-gray-700 dark:text-gray-200">
                      {item.careerBranches.join(' / ')}
                    </Text>
                  </>
                ) : null}

                {item.learningResources.length > 0 ? (
                  <>
                    <Text className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('roadmap.learningResources')}
                    </Text>
                    <View className="gap-2">
                      {item.learningResources.map((resource) => (
                        <View
                          key={resource.id}
                          className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                        >
                          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                            {resource.title}
                          </Text>
                          {resource.description ? (
                            <Text className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                              {resource.description}
                            </Text>
                          ) : null}
                          {resource.url ? (
                            <Pressable
                              className="mt-2 rounded-md bg-blue-600 px-3 py-2 dark:bg-blue-500"
                              onPress={() =>
                                WebBrowser.openBrowserAsync(resource.url!)
                              }
                            >
                              <Text className="text-center text-xs font-semibold text-white">
                                {t('recommendations.actions.openLink')}
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
