import { getAiRiskIndex } from '@/features/career/api/career.api';
import type {
  AiRiskIndexResponse,
  AiRiskLevel,
} from '@/features/career/model/types';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import * as Clipboard from 'expo-clipboard';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Share,
  Text,
  View,
} from 'react-native';
import { useProfileStore } from '@/features/profile/store/profile-store';

function riskBadgeClass(level: AiRiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700';
    case 'medium':
      return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700';
    case 'high':
      return 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
  }
}

function riskTextClass(level: AiRiskLevel): string {
  switch (level) {
    case 'low':
      return 'text-emerald-900 dark:text-emerald-100';
    case 'medium':
      return 'text-amber-900 dark:text-amber-100';
    case 'high':
      return 'text-red-900 dark:text-red-100';
    default:
      return 'text-gray-900 dark:text-white';
  }
}

export function AiSustainabilityCard() {
  const profile = useProfileStore((s) => s.profile);
  const { t } = useTranslation('career');
  const router = useRouter();
  const [data, setData] = useState<AiRiskIndexResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [missingSeed, setMissingSeed] = useState(false);

  // const load = useCallback(async () => {
  //   if (!profile) return;
  //   setLoading(true);
  //   setError(null);
  //   setMissingSeed(false);
  //   try {
  //     const res = await getAiRiskIndex();
  //     setData(res);
  //   } catch (e: unknown) {
  //     setData(null);
  //     if (isAxiosError(e) && e.response?.status === 404) {
  //       setMissingSeed(true);
  //       setError(null);
  //     } else {
  //       setError(t('aiRisk.fetchError'));
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [profile, t]);
  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);
  const loadData = useCallback(async () => {
    if (!profile) return;
    if (data !== null && !loading && !errorKey && !missingSeed) {
      return;
    }
    setLoading(true);
    setErrorKey(null);
    setMissingSeed(false);
    try {
      const res = await getAiRiskIndex();

      if (isMountedRef.current) {
        setData(res);
        hasFetchedRef.current = true;
      }
    } catch (e: unknown) {
      if (isMountedRef.current) {
        setData(null);

        if (isAxiosError(e) && e.response?.status === 404) {
          setMissingSeed(true);
          setErrorKey(null);
        } else {
          setErrorKey('aiRisk.fetchError');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [profile, data, loading, errorKey, missingSeed]);

  useEffect(() => {
    isMountedRef.current = true;

    // Загружаем данные только если есть профиль и еще не загружали
    if (profile && !hasFetchedRef.current && !loading) {
      loadData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [profile, loadData, loading]);

  const riskLabelKey =
    data?.riskLevel === 'low'
      ? 'aiRisk.riskLow'
      : data?.riskLevel === 'medium'
        ? 'aiRisk.riskMedium'
        : 'aiRisk.riskHigh';

  const handleShare = async () => {
    if (!data) return;
    const riskLabel = t(riskLabelKey);
    const message = t('aiRisk.shareText', {
      riskLabel,
      score: data.riskScore,
      direction: data.profile.direction,
      level: data.profile.level,
    });

    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: t('aiRisk.title'),
            text: message,
          });
        } else {
          await Clipboard.setStringAsync(message);
          if (typeof window !== 'undefined') {
            window.alert(t('aiRisk.copied'));
          }
        }
        return;
      }
      await Share.share({ message });
    } catch {
      // пользователь отменил Share — игнорируем
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <View className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <Text className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {t('aiRisk.title')}
      </Text>
      <Text className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t('aiRisk.subtitle')}
      </Text>

      {loading && (
        <View className="items-center py-6">
          <ActivityIndicator />
          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('aiRisk.loading')}
          </Text>
        </View>
      )}

      {!loading && missingSeed && (
        <Text className="text-sm text-amber-800 dark:text-amber-200">
          {t('aiRisk.missingSeed')}
        </Text>
      )}

      {!loading && errorKey && (
        <Text className="text-sm text-red-600 dark:text-red-400">
          {t(errorKey)}
        </Text>
      )}

      {!loading && data && (
        <>
          <View
            className={`mb-3 rounded-lg border px-3 py-2 ${riskBadgeClass(data.riskLevel)}`}
          >
            <Text
              className={`text-center text-base font-bold ${riskTextClass(data.riskLevel)}`}
            >
              {t(riskLabelKey)} · {data.riskScore}/100
            </Text>
          </View>
          <Text className="mb-4 text-sm leading-5 text-gray-800 dark:text-gray-200">
            {data.riskDescription}
          </Text>
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('aiRisk.protectiveSkills')}
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {data.protectiveSkills.map((skill) => (
              <View
                key={skill}
                className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700"
              >
                <Text className="text-xs text-gray-800 dark:text-gray-100">
                  {skill}
                </Text>
              </View>
            ))}
          </View>

          <PrimaryButton
            onPress={() => router.push('/recommendations')}
            accessibilityLabel={t('aiRisk.ctaCourses')}
            className="mb-2 mt-0"
          >
            {t('aiRisk.ctaCourses')}
          </PrimaryButton>

          <Pressable
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert(
                  `${t('trigger.consultationTitle')}\n\n${t('trigger.consultationStub')}`
                );
              } else {
                Alert.alert(
                  t('trigger.consultationTitle'),
                  t('trigger.consultationStub')
                );
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t('aiRisk.ctaConsultation')}
            className="mb-3 justify-center rounded-lg border border-blue-600 bg-transparent px-6 py-4 dark:border-blue-400"
          >
            <Text className="text-center text-base font-semibold text-blue-600 dark:text-blue-400">
              {t('aiRisk.ctaConsultation')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={t('aiRisk.share')}
            className="justify-center rounded-lg border border-gray-300 bg-gray-50 px-6 py-3 dark:border-gray-600 dark:bg-gray-900"
          >
            <Text className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t('aiRisk.share')}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
