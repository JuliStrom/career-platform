import { createEducation } from '@/features/education/api/education.api';
import { AdminHeader } from '@/features/admin/ui/AdminHeader';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function parseJsonArray(value: string): string[] {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error('skillsTags must be an array');
  }
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

export default function AdminCreateEducationScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [type, setType] = useState('');
  const [direction, setDirection] = useState('');
  const [level, setLevel] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [price, setPrice] = useState('0');
  const [locationType, setLocationType] = useState('online');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [url, setUrl] = useState('');
  const [skillsTags, setSkillsTags] = useState('[]');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isReskilling, setIsReskilling] = useState(false);
  const [isInternational, setIsInternational] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError(t('educations.titleRequired'));
      return;
    }

    let parsedSkillsTags: string[];
    try {
      parsedSkillsTags = parseJsonArray(skillsTags);
    } catch {
      setError(t('educations.skillsTagsInvalid'));
      return;
    }

    if (parsedSkillsTags.length === 0) {
      setError(t('educations.skillsTagsRequired'));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await createEducation({
        title: title.trim(),
        provider: provider.trim() || null,
        type: type.trim() || null,
        direction: direction.trim() || null,
        level: level.trim() || null,
        durationWeeks: durationWeeks.trim() ? Number(durationWeeks) : null,
        price: price.trim() ? Number(price) : 0,
        locationType: locationType.trim() || 'online',
        city: city.trim() || null,
        country: country.trim() || null,
        url: url.trim() || null,
        tags: parsedSkillsTags,
        skillsTags: parsedSkillsTags,
        isFeatured,
        isReskilling,
        isInternational,
      });
      router.replace('/admin/education' as Href);
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <AdminHeader title={t('educations.createTitle')} />
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
            editable={!loading}
          />
          <NamedField
            label={t('educations.provider')}
            value={provider}
            onChangeText={setProvider}
            editable={!loading}
          />
          <NamedField
            label={t('educations.type')}
            value={type}
            onChangeText={setType}
            placeholder="course"
            editable={!loading}
          />
          <NamedField
            label={t('educations.direction')}
            value={direction}
            onChangeText={setDirection}
            editable={!loading}
          />
          <NamedField
            label={t('educations.level')}
            value={level}
            onChangeText={setLevel}
            placeholder="Beginner"
            editable={!loading}
          />
          <NamedField
            label={t('educations.durationWeeks')}
            value={durationWeeks}
            onChangeText={setDurationWeeks}
            keyboardType="number-pad"
            editable={!loading}
          />
          <NamedField
            label={t('educations.price')}
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            editable={!loading}
          />
          <NamedField
            label={t('educations.locationType')}
            value={locationType}
            onChangeText={setLocationType}
            placeholder="online"
            editable={!loading}
          />
          <NamedField
            label={t('educations.city')}
            value={city}
            onChangeText={setCity}
            editable={!loading}
          />
          <NamedField
            label={t('educations.country')}
            value={country}
            onChangeText={setCountry}
            editable={!loading}
          />
          <NamedField
            label={t('educations.url')}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />
          <NamedField
            label={t('educations.skillsTags')}
            value={skillsTags}
            onChangeText={setSkillsTags}
            placeholder='["ux research", "figma"]'
            autoCapitalize="none"
            editable={!loading}
          />

          <EducationBooleanField
            label={t('educations.isFeatured')}
            value={isFeatured}
            onChange={setIsFeatured}
            disabled={loading}
            t={t}
          />
          <EducationBooleanField
            label={t('educations.isReskilling')}
            value={isReskilling}
            onChange={setIsReskilling}
            disabled={loading}
            t={t}
          />
          <EducationBooleanField
            label={t('educations.isInternational')}
            value={isInternational}
            onChange={setIsInternational}
            disabled={loading}
            t={t}
          />

          <View className="mt-6 gap-3">
            <PrimaryButton
              onPress={handleSubmit}
              isLoading={loading}
              disabled={loading}
            >
              {t('educations.create')}
            </PrimaryButton>
            <PrimaryButton
              onPress={() => router.replace('/admin/education' as Href)}
              className="bg-gray-500 dark:bg-gray-600"
              disabled={loading}
            >
              {t('cancel')}
            </PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EducationBooleanField({
  label,
  value,
  onChange,
  disabled,
  t,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  t: (key: string) => string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <View className="flex-row gap-2">
        <PrimaryButton
          onPress={() => onChange(true)}
          disabled={disabled}
          className={`mb-0 flex-1 ${value ? '' : 'bg-gray-400 dark:bg-gray-600'}`}
        >
          {t('educations.yes')}
        </PrimaryButton>
        <PrimaryButton
          onPress={() => onChange(false)}
          disabled={disabled}
          className={`mb-0 flex-1 ${!value ? '' : 'bg-gray-400 dark:bg-gray-600'}`}
        >
          {t('educations.no')}
        </PrimaryButton>
      </View>
    </View>
  );
}
