import {
  fetchAnalyticsDetails,
  fetchAnalyticsFunnel,
  fetchAnalyticsSummary,
  type AnalyticsDetails,
  type AnalyticsFunnel,
  type AnalyticsSummary,
} from '@/features/admin/api/analytics.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { handleApiError } from '@/shared/config/api';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminAnalyticsScreen() {
  const { t } = useTranslation('common');
  const { t: tCareer } = useTranslation('career');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [funnel, setFunnel] = useState<AnalyticsFunnel | null>(null);
  const [details, setDetails] = useState<AnalyticsDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [s, f, d] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchAnalyticsFunnel(),
        fetchAnalyticsDetails(),
      ]);
      setSummary(s);
      setFunnel(f);
      setDetails(d);
    } catch (e) {
      setError(`${t('analytics.loadError')}: ${handleApiError(e)}`);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !summary) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('adminAnalyticsTitle')} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
      >
        {error && (
          <View className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <Text className="text-red-700 dark:text-red-300">{error}</Text>
          </View>
        )}

        {summary && (
          <>
            <AnalyticsSection title={t('analytics.summaryTitle')}>
              <View className="gap-3">
                <KpiCard
                  label={t('analytics.usersTotal')}
                  value={summary.usersTotal}
                />
                <KpiCard
                  label={t('analytics.invitesCreated')}
                  value={summary.invitesCreated}
                />
                <KpiCard
                  label={t('analytics.invitesActive')}
                  value={summary.invitesActive ?? 0}
                />
                <KpiCard
                  label={t('analytics.invitesActivated')}
                  value={summary.invitesActivated}
                />
                <KpiCard
                  label={t('analytics.profilesCompleted')}
                  value={summary.profilesCompleted}
                />
                <KpiCard
                  label={t('analytics.jobsViewed')}
                  value={summary.jobsViewed}
                />
              </View>
            </AnalyticsSection>
            <AnalyticsSection title={t('analytics.careerTriggersTitle')}>
              <View className="gap-3">
                <KpiCard
                  label={t('analytics.careerTriggerUsers')}
                  value={summary.careerTriggerUsers}
                />
                <KpiCard
                  label={t('analytics.careerTriggerRoadmapUsers')}
                  value={summary.careerTriggerRoadmapUsers}
                />
                <KpiCard
                  label={t('analytics.careerTriggerCoursesUsers')}
                  value={summary.careerTriggerCoursesUsers}
                />
                <KpiCard
                  label={t('analytics.careerTriggerConsultationUsers')}
                  value={summary.careerTriggerConsultationUsers}
                />
              </View>
            </AnalyticsSection>
          </>
        )}

        {funnel && (
          <AnalyticsSection title={t('analytics.funnelTitle')}>
            <View className="gap-3">
              <KpiCard
                label={t('analytics.invitesCreated')}
                value={funnel.invitesCreated}
              />
              <KpiCard
                label={t('analytics.invitesOpened')}
                value={funnel.invitesOpened}
              />
              <KpiCard
                label={t('analytics.registrationsCompleted')}
                value={funnel.registrationsCompleted}
              />
              <KpiCard
                label={t('analytics.profilesCompleted')}
                value={funnel.profilesCompleted}
              />
            </View>
          </AnalyticsSection>
        )}

        {details && (
          <>
            <AnalyticsSection title={t('analytics.topDirections')}>
              {details.topDirections.map((item) => (
                <DistributionRow
                  key={item.value}
                  label={tCareer(`directions.${item.value}`)}
                  value={item.count}
                />
              ))}
            </AnalyticsSection>

            <AnalyticsSection title={t('analytics.topLevels')}>
              {details.topLevels.map((item) => (
                <DistributionRow
                  key={item.value}
                  label={tCareer(`levels.${item.value}`)}
                  value={item.count}
                />
              ))}
            </AnalyticsSection>

            <AnalyticsSection title={t('analytics.careerFunnelTitle')}>
              <KpiCard
                label={t('analytics.careerFunnelRegistered')}
                value={details.careerFunnel.registered}
              />
              <KpiCard
                label={t('analytics.careerFunnelProfile')}
                value={details.careerFunnel.profile}
              />
              <KpiCard
                label={t('analytics.careerFunnelTrigger')}
                value={details.careerFunnel.trigger}
              />
              <KpiCard
                label={t('analytics.careerFunnelAction')}
                value={details.careerFunnel.action}
              />
            </AnalyticsSection>

            <AnalyticsSection title={t('analytics.tracksTitle')}>
              <DistributionRow
                label={t('analytics.trackStandard')}
                value={details.tracks.standard}
              />
              <DistributionRow
                label={t('analytics.trackReskilling')}
                value={details.tracks.reskilling}
              />
              <DistributionRow
                label={t('analytics.trackAbroad')}
                value={details.tracks.abroad}
              />
            </AnalyticsSection>

            <AnalyticsSection title={t('analytics.aiRiskTitle')}>
              <DistributionRow
                label={t('analytics.aiRiskLow')}
                value={details.aiRisk.low}
              />
              <DistributionRow
                label={t('analytics.aiRiskMedium')}
                value={details.aiRisk.medium}
              />
              <DistributionRow
                label={t('analytics.aiRiskHigh')}
                value={details.aiRisk.high}
              />
              <DistributionRow
                label={t('analytics.aiRiskUnknown')}
                value={details.aiRisk.unknown}
              />
            </AnalyticsSection>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AnalyticsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-8">
      <View className="mb-4 rounded-xl border-l-4 border-blue-600 bg-blue-50 px-4 py-3 dark:bg-blue-950/40">
        <Text className="text-lg font-bold text-blue-950 dark:text-blue-100">
          {title}
        </Text>
      </View>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function DistributionRow({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Text className="mr-4 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <Text className="text-lg font-bold text-blue-700 dark:text-blue-300">
        {value.toLocaleString()}
      </Text>
    </View>
  );
}

function KpiCard({ label, value }: { label: string; value?: number }) {
  const safeValue = value ?? 0;
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Text className="mr-4 flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <Text className="text-xl font-bold text-blue-700 dark:text-blue-300">
        {safeValue.toLocaleString()}
      </Text>
    </View>
  );
}
