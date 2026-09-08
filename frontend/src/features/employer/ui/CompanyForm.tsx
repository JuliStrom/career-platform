import type { CompanyPayload } from '@/features/employer/model';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import {
  GROWTH_SPEED_VALUES,
  JOB_WORK_FORMATS,
  TEAM_SIZE_VALUES,
  WORK_LANGUAGE_VALUES,
  type GrowthSpeed,
  type JobWorkFormat,
  type TeamSize,
  type WorkLanguage,
} from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface CompanyFormProps {
  footer?: ReactNode;
  initialValues?: CompanyPayload;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (payload: CompanyPayload) => Promise<void>;
}

export function CompanyForm({
  footer,
  initialValues,
  isLoading = false,
  error,
  onSubmit,
}: CompanyFormProps) {
  const { t } = useTranslation('employer');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [workFormat, setWorkFormat] = useState<JobWorkFormat>(
    JOB_WORK_FORMATS[0]
  );
  const [teamSize, setTeamSize] = useState<TeamSize>(TEAM_SIZE_VALUES[0]);
  const [languages, setLanguages] = useState<WorkLanguage[]>([
    WORK_LANGUAGE_VALUES[0],
  ]);
  const [valuesTags, setValuesTags] = useState('');
  const [growthSpeed, setGrowthSpeed] = useState<GrowthSpeed>(
    GROWTH_SPEED_VALUES[0]
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) return;
    setName(initialValues.name);
    setDescription(initialValues.description);
    setLogo(initialValues.logo ?? '');
    setWorkFormat(initialValues.workFormat);
    setTeamSize(initialValues.teamSize);
    setLanguages(initialValues.languages);
    setValuesTags(initialValues.valuesTags.join(', '));
    setGrowthSpeed(initialValues.growthSpeed);
  }, [initialValues]);

  function toggleLanguage(language: WorkLanguage) {
    setLanguages((current) =>
      current.includes(language)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== language)
        : [...current, language]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !description.trim()) {
      setValidationError(t('company.required'));
      return;
    }
    if (logo.trim()) {
      try {
        const logoUrl = new URL(logo.trim());
        if (!['http:', 'https:'].includes(logoUrl.protocol)) throw new Error();
      } catch {
        setValidationError(t('company.invalidLogo'));
        return;
      }
    }

    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      logo: logo.trim() || null,
      workFormat,
      teamSize,
      languages,
      valuesTags: valuesTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      growthSpeed,
    });
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        {t('company.title')}
      </Text>
      <Text className="mb-6 text-base text-gray-600 dark:text-gray-300">
        {t('company.subtitle')}
      </Text>

      <NamedField
        label={t('company.name')}
        value={name}
        onChangeText={setName}
        editable={!isLoading}
      />
      <NamedField
        label={t('company.description')}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={300}
        editable={!isLoading}
      />
      <NamedField
        label={t('company.logo')}
        value={logo}
        onChangeText={setLogo}
        placeholder={t('company.logoPlaceholder')}
        keyboardType="url"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <ChipSelector
        label={t('company.workFormat')}
        options={JOB_WORK_FORMATS}
        selectedValue={workFormat}
        onSelect={setWorkFormat}
        translationKey="workFormats"
        namespace="jobs"
      />
      <ChipSelector
        label={t('company.teamSize')}
        options={TEAM_SIZE_VALUES}
        selectedValue={teamSize}
        onSelect={setTeamSize}
        translationKey="teamSizes"
        namespace="jobs"
      />
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('company.languages')}
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {WORK_LANGUAGE_VALUES.map((language) => {
          const selected = languages.includes(language);
          return (
            <Pressable
              key={language}
              onPress={() => toggleLanguage(language)}
              disabled={isLoading}
              className={`rounded-full px-3 py-1.5 ${
                selected ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text
                className={
                  selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }
              >
                {t(`company.languageValues.${language}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <NamedField
        label={t('company.valuesTags')}
        value={valuesTags}
        onChangeText={setValuesTags}
        placeholder={t('company.valuesTagsPlaceholder')}
        editable={!isLoading}
      />
      <ChipSelector
        label={t('company.growthSpeed')}
        options={GROWTH_SPEED_VALUES}
        selectedValue={growthSpeed}
        onSelect={setGrowthSpeed}
        translationKey="growthSpeeds"
        namespace="jobs"
      />

      {validationError || error ? (
        <Text className="mb-4 text-sm text-red-600 dark:text-red-400">
          {validationError || error}
        </Text>
      ) : null}
      <PrimaryButton
        onPress={() => void handleSubmit()}
        disabled={isLoading}
        isLoading={isLoading}
        className="mb-0"
      >
        {t('company.save')}
      </PrimaryButton>
      {footer}
    </ScrollView>
  );
}
