import { RecommendationCard } from '@/features/career/ui';
import { getRecommendationById } from '@/features/career/api';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { FullScreenLoader, IconNavPressable } from '@/src/shared/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Recommendation } from '@/features/career/model';

export default function RecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation('career');
  const router = useRouter();

  /** Всегда на список рекомендаций (router.back() часто ведёт на профиль из-за табов). */
  const goBackToList = useCallback(() => {
    router.replace('/recommendations');
  }, [router]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      getRecommendationById(id)
        .then(setRecommendation)
        .catch((e) =>
          setError(e instanceof Error ? e.message : 'Ошибка загрузки')
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (!id) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        edges={['top', 'bottom']}
      >
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-gray-500 dark:text-gray-400">
            {t('scenarios.notFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <FullScreenLoader message={t('recommendations.loading')} />;
  }

  if (error || !recommendation) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        edges={['top', 'bottom']}
      >
        <View className="flex-row items-center gap-3 px-6 pt-6">
          <IconNavPressable
            name="arrow-back"
            accessibilityLabel={t('recommendations.goBack')}
            onPress={goBackToList}
          />
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('recommendations.title')}
          </Text>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          <View className="rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
            <Text className="text-sm text-red-700 dark:text-red-300">
              {error ?? t('scenarios.notFound')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
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
          onPress={goBackToList}
        />
        <Text
          className="flex-1 text-xl font-semibold text-gray-900 dark:text-white"
          numberOfLines={1}
        >
          {recommendation.title}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 16 }}
      >
        <RecommendationCard recommendation={recommendation} />
      </ScrollView>
    </SafeAreaView>
  );
}
