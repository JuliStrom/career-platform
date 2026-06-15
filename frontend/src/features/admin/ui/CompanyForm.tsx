import type { CompanyPayload } from '@/features/admin/api/resources.api';
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
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface Props {
  initialValues?: CompanyPayload;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: CompanyPayload) => Promise<void>;
  onCancel: () => void;
}

export function CompanyForm({
  initialValues,
  loading,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [workFormat, setWorkFormat] = useState<JobWorkFormat>(
    JOB_WORK_FORMATS[0]
  );
  const [valuesTags, setValuesTags] = useState('');
  const [growthSpeed, setGrowthSpeed] = useState<GrowthSpeed>(
    GROWTH_SPEED_VALUES[0]
  );
  const [teamSize, setTeamSize] = useState<TeamSize>(TEAM_SIZE_VALUES[0]);
  const [languages, setLanguages] = useState<WorkLanguage[]>([
    WORK_LANGUAGE_VALUES[0],
  ]);
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) return;
    setName(initialValues.name);
    setLogo(initialValues.logo ?? '');
    setWorkFormat(initialValues.workFormat);
    setValuesTags(initialValues.valuesTags.join(', '));
    setGrowthSpeed(initialValues.growthSpeed);
    setTeamSize(initialValues.teamSize);
    setLanguages(initialValues.languages);
    setDescription(initialValues.description);
  }, [initialValues]);

  async function handleSubmit() {
    if (!name.trim() || !description.trim()) {
      setValidationError(t('adminCompanies.required'));
      return;
    }
    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      logo: logo.trim() || null,
      workFormat,
      valuesTags: valuesTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      growthSpeed,
      teamSize,
      languages,
      description: description.trim(),
    });
  }

  function toggleLanguage(language: WorkLanguage) {
    setLanguages((current) => {
      if (current.includes(language)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== language);
      }
      return [...current, language];
    });
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <NamedField
        label={t('adminCompanies.name')}
        value={name}
        onChangeText={setName}
        editable={!loading}
      />
      <NamedField
        label={t('adminCompanies.logo')}
        value={logo}
        onChangeText={setLogo}
        keyboardType="url"
        autoCapitalize="none"
        editable={!loading}
      />
      <ChipSelector
        label={t('adminCompanies.workFormat')}
        options={JOB_WORK_FORMATS}
        selectedValue={workFormat}
        onSelect={setWorkFormat}
        translationKey="workFormats"
        namespace="jobs"
      />
      <ChipSelector
        label={t('adminCompanies.growthSpeed')}
        options={GROWTH_SPEED_VALUES}
        selectedValue={growthSpeed}
        onSelect={setGrowthSpeed}
        translationKey="growthSpeeds"
        namespace="jobs"
      />
      <ChipSelector
        label={t('adminCompanies.teamSize')}
        options={TEAM_SIZE_VALUES}
        selectedValue={teamSize}
        onSelect={setTeamSize}
        translationKey="teamSizes"
        namespace="jobs"
      />
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('adminCompanies.languages')}
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {WORK_LANGUAGE_VALUES.map((language) => {
          const selected = languages.includes(language);
          return (
            <Pressable
              key={language}
              onPress={() => toggleLanguage(language)}
              className={`rounded-full px-3 py-1.5 ${selected ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Text
                className={
                  selected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }
              >
                {language}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <NamedField
        label={t('adminCompanies.valuesTags')}
        value={valuesTags}
        onChangeText={setValuesTags}
        placeholder={t('adminCompanies.valuesTagsPlaceholder')}
        editable={!loading}
      />
      <NamedField
        label={t('adminCompanies.description')}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={300}
        editable={!loading}
      />
      {(validationError || error) && (
        <Text className="mb-4 text-sm text-red-600 dark:text-red-400">
          {validationError || error}
        </Text>
      )}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <PrimaryButton
            onPress={onCancel}
            disabled={loading}
            className="mb-0 bg-gray-500"
          >
            {t('cancel')}
          </PrimaryButton>
        </View>
        <View className="flex-1">
          <PrimaryButton
            onPress={handleSubmit}
            disabled={loading}
            isLoading={loading}
            className="mb-0"
          >
            {t('save')}
          </PrimaryButton>
        </View>
      </View>
    </ScrollView>
  );
}
