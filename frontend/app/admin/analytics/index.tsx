import {
  fetchAnalyticsFunnel,
  fetchAnalyticsSummary,
  type AnalyticsFunnel,
  type AnalyticsSummary,
} from '@/features/admin/api/analytics.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { handleApiError } from '@/shared/config/api';
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
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [funnel, setFunnel] = useState<AnalyticsFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchAnalyticsFunnel(),
      ]);
      setSummary(s);
      setFunnel(f);
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
          <View className="mb-8">
            <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t('analytics.summaryTitle')}
            </Text>
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
          </View>
        )}

        {funnel && (
          <View>
            <Text className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t('analytics.funnelTitle')}
            </Text>
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function KpiCard({ label, value }: { label: string; value?: number }) {
  const safeValue = value ?? 0;
  return (
    <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <Text className="text-sm text-gray-600 dark:text-gray-400">{label}</Text>
      <Text className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
        {safeValue.toLocaleString()}
      </Text>
    </View>
  );
}
