import {
  fetchEducationById,
  updateEducation,
} from '@/features/education/api/education.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminEditEducationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('common');
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [type, setType] = useState('');
  const [direction, setDirection] = useState('');
  const [level, setLevel] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [price, setPrice] = useState('');
  const [locationType, setLocationType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (loadedIdRef.current === id) return;
    loadedIdRef.current = id;

    async function loadEducation() {
      setError(null);
      setLoading(true);
      try {
        const education = await fetchEducationById(id);
        setTitle(education.title);
        setProvider(education.provider ?? '');
        setType(education.type ?? '');
        setDirection(education.direction ?? '');
        setLevel(education.level ?? '');
        setDurationWeeks(
          education.durationWeeks == null ? '' : String(education.durationWeeks)
        );
        setPrice(education.price == null ? '' : String(education.price));
        setLocationType(education.locationType ?? '');
      } catch {
        setError(t('errors.networkError'));
      } finally {
        setLoading(false);
      }
    }

    loadEducation();
  }, [id, t]);

  async function handleSubmit() {
    if (!id) return;
    setError(null);
    setSaving(true);
    try {
      await updateEducation(id, {
        title,
        provider: provider.trim() || null,
        type: type.trim() || null,
        direction: direction.trim() || null,
        level: level.trim() || null,
        durationWeeks: durationWeeks.trim() ? Number(durationWeeks) : null,
        price: price.trim() ? Number(price) : 0,
        locationType: locationType.trim() || undefined,
      });
      router.replace('/admin/education' as Href);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('educations.editTitle')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/40">
              <Text className="text-sm text-red-700 dark:text-red-300">
                {error}
              </Text>
            </View>
          )}

          <NamedField
            label={t('educations.title')}
            value={title}
            onChangeText={setTitle}
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.provider')}
            value={provider}
            onChangeText={setProvider}
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.type')}
            value={type}
            onChangeText={setType}
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.direction')}
            value={direction}
            onChangeText={setDirection}
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.level')}
            value={level}
            onChangeText={setLevel}
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.durationWeeks')}
            value={durationWeeks}
            onChangeText={setDurationWeeks}
            keyboardType="number-pad"
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.price')}
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            editable={!loading && !saving}
          />
          <NamedField
            label={t('educations.locationType')}
            value={locationType}
            onChangeText={setLocationType}
            editable={!loading && !saving}
          />

          <View className="mt-2 gap-3">
            <PrimaryButton
              onPress={handleSubmit}
              isLoading={saving}
              disabled={loading || saving}
            >
              {t('save')}
            </PrimaryButton>
            <PrimaryButton
              onPress={() => router.replace('/admin/education' as Href)}
              className="bg-gray-500 dark:bg-gray-600"
              disabled={saving}
            >
              {t('cancel')}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
