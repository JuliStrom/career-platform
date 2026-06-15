import { getCareerChangeHub } from '@/features/career/api/career.api';
import type {
  CareerChangeGovernmentProgram,
  CareerChangeHubResource,
  CareerChangeHubResponse,
  CareerChangeSuccessStory,
} from '@/features/career/model/types';
import { handleApiError } from '@/shared/config/api';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { IconNavPressable } from '@/src/shared/ui';
import { FullScreenLoader } from '@/src/shared/ui/common/FullScreenLoader';
import { isAxiosError } from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Children, useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function ResourceCard({
  item,
  openLabel,
}: {
  item: CareerChangeHubResource;
  openLabel: string;
}) {
  return (
    <View className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
        {item.title}
      </Text>
      {item.description ? (
        <Text className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          {item.description}
        </Text>
      ) : null}
      {item.url ? (
        <Pressable
          className="mt-2 rounded-md bg-blue-600 px-3 py-2 dark:bg-blue-500"
          onPress={() => WebBrowser.openBrowserAsync(item.url!)}
        >
          <Text className="text-center text-xs font-semibold text-white">
            {openLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function GovProgramCard({
  item,
  openLabel,
}: {
  item: CareerChangeGovernmentProgram;
  openLabel: string;
}) {
  return (
    <View className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
        {item.title}
      </Text>
      <Text className="mt-1 text-xs text-gray-700 dark:text-gray-300">
        {item.description}
      </Text>
      <Pressable
        className="mt-2 rounded-md bg-emerald-700 px-3 py-2 dark:bg-emerald-600"
        onPress={() => WebBrowser.openBrowserAsync(item.url)}
      >
        <Text className="text-center text-xs font-semibold text-white">
          {openLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function StoryCard({ item }: { item: CareerChangeSuccessStory }) {
  return (
    <View className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-800 dark:bg-violet-950/30">
      <Text className="text-xs font-medium uppercase text-violet-700 dark:text-violet-300">
        {item.ageRange}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
        {item.title}
      </Text>
      <Text className="mt-1 text-xs text-gray-700 dark:text-gray-300">
        {item.summary}
      </Text>
    </View>
  );
}

export default function CareerChangeHubScreen() {
  const router = useRouter();
  const { t } = useTranslation('career');
  const { t: tProfile } = useTranslation('profile');

  const [hub, setHub] = useState<CareerChangeHubResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    setError(null);
    try {
      const data = await getCareerChangeHub();
      setHub(data);
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 403) {
        setForbidden(true);
      } else {
        setError(handleApiError(e));
      }
      setHub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openLinkLabel = t('recommendations.actions.openLink');
  const emptyValue = '-';

  if (loading && !hub) {
    return <FullScreenLoader message={t('careerChangeHub.loading')} />;
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
          onPress={() => router.replace('/profile')}
        />
        <Text className="flex-1 text-xl font-semibold text-gray-900 dark:text-white">
          {t('careerChangeHub.title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 24,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {forbidden ? (
          <View className="mb-4 gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <Text className="text-sm text-amber-900 dark:text-amber-100">
              {t('careerChangeHub.forbidden')}
            </Text>
            <PrimaryButton
              onPress={() => router.push('/profile/edit')}
              accessibilityLabel={t('careerChangeHub.forbiddenCta')}
            >
              {t('careerChangeHub.forbiddenCta')}
            </PrimaryButton>
          </View>
        ) : null}

        {error ? (
          <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
            <Text className="text-sm text-red-700 dark:text-red-300">
              {error}
            </Text>
            <PrimaryButton onPress={load} className="mt-3">
              {t('careerChangeHub.retry')}
            </PrimaryButton>
          </View>
        ) : null}

        {!forbidden && hub ? (
          <View className="gap-6">
            <View className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/40">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('careerChangeHub.introTitle')}
              </Text>
              <Text className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('careerChangeHub.introBody')}
              </Text>
            </View>

            <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                {t('careerChangeHub.trackSummary')}
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {tProfile('careerChange.currentField')}:{' '}
                {hub.track.currentField ?? emptyValue}
              </Text>
              <Text className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {tProfile('careerChange.targetDirection')}:{' '}
                {hub.track.targetDirection
                  ? t(`directions.${hub.track.targetDirection}`)
                  : emptyValue}
              </Text>
              <Text className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {tProfile('careerChange.ageRange')}:{' '}
                {hub.track.ageRange
                  ? tProfile(`careerChange.ageRanges.${hub.track.ageRange}`)
                  : emptyValue}
              </Text>
              <Text className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {tProfile('careerChange.motivation')}:{' '}
                {hub.track.motivation
                  ? tProfile(`careerChange.motivations.${hub.track.motivation}`)
                  : emptyValue}
              </Text>
              <Text className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {tProfile('careerChange.timeline')}:{' '}
                {hub.track.timeline
                  ? tProfile(`careerChange.timelines.${hub.track.timeline}`)
                  : emptyValue}
              </Text>
            </View>

            <HubSection
              title={t('careerChangeHub.sections.fromScratch')}
              emptyText={t('careerChangeHub.sectionEmpty')}
            >
              {hub.learningFromScratch.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  openLabel={openLinkLabel}
                />
              ))}
            </HubSection>

            <HubSection
              title={t('careerChangeHub.sections.general')}
              emptyText={t('careerChangeHub.sectionEmpty')}
            >
              {hub.learningGeneral.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  openLabel={openLinkLabel}
                />
              ))}
            </HubSection>

            <HubSection title={t('careerChangeHub.sections.govPrograms')}>
              {hub.governmentPrograms.map((item) => (
                <GovProgramCard
                  key={item.id}
                  item={item}
                  openLabel={openLinkLabel}
                />
              ))}
            </HubSection>

            <HubSection
              title={t('careerChangeHub.sections.internshipsKz')}
              emptyText={t('careerChangeHub.sectionEmpty')}
            >
              {hub.internshipsKz.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  openLabel={openLinkLabel}
                />
              ))}
            </HubSection>

            <HubSection
              title={t('careerChangeHub.sections.internshipsAbroad')}
              emptyText={t('careerChangeHub.sectionEmpty')}
            >
              {hub.internshipsAbroad.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  openLabel={openLinkLabel}
                />
              ))}
            </HubSection>

            <HubSection title={t('careerChangeHub.sections.successStories')}>
              {hub.successStories.map((item) => (
                <StoryCard key={item.id} item={item} />
              ))}
            </HubSection>

            <HubSection
              title={t('careerChangeHub.sections.successStoryResources')}
              emptyText={t('careerChangeHub.sectionEmpty')}
            >
              {hub.successStoryResources.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  openLabel={openLinkLabel}
                />
              ))}
            </HubSection>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HubSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText?: string;
  children: React.ReactNode;
}) {
  const isEmpty = Children.count(children) === 0;

  return (
    <View>
      <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </Text>
      {isEmpty && emptyText ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {emptyText}
        </Text>
      ) : null}
      {!isEmpty ? <View className="gap-2">{children}</View> : null}
    </View>
  );
}
