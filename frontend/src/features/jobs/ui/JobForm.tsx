import {
  createJobFormSchema,
  CreateJobPayload,
  DEFAULT_CURRENCY,
  type CreateJobFormValues,
  type Currency,
  type JobSalary,
} from '@/features/jobs/model';
import { mapJobPayloadToFormValues } from '@/features/jobs/utils/job-form.utils';
import { parseListInput } from '@/features/jobs/utils/parse-list.utils';
import { parseSalaryValues } from '@/features/jobs/utils/validation.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import type {
  GrowthSpeed,
  JobWorkFormat,
  TeamSize,
  WorkLanguage,
} from '@/shared/model';
import {
  DIRECTION_VALUES,
  GROWTH_SPEED_VALUES,
  JOB_WORK_FORMATS,
  LEVEL_VALUES,
  TEAM_SIZE_VALUES,
  WORK_LANGUAGE_VALUES,
} from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SalaryField } from './SalaryField';

const WORK_FORMAT_OPTIONS: JobWorkFormat[] = JOB_WORK_FORMATS;
const GROWTH_SPEED_OPTIONS: GrowthSpeed[] = GROWTH_SPEED_VALUES;
const TEAM_SIZE_OPTIONS: TeamSize[] = TEAM_SIZE_VALUES;
const LANGUAGE_OPTIONS: WorkLanguage[] = WORK_LANGUAGE_VALUES;

interface CreateJobFormProps {
  onSubmit: (values: CreateJobPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  initialValues?: Partial<CreateJobPayload>;
  titleKey?: string;
}

interface MultiChipSelectorProps<T extends string> {
  label: string;
  options: readonly T[];
  selectedValues: readonly T[];
  onToggle: (value: T) => void;
  translationKey: string;
  namespace?: string;
}

function MultiChipSelector<T extends string>({
  label,
  options,
  selectedValues,
  onToggle,
  translationKey,
  namespace = 'jobs',
}: MultiChipSelectorProps<T>) {
  const { t } = useTranslation(namespace);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => onToggle(option)}
              className={`rounded-full px-3 py-1.5 ${
                isSelected
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                className={
                  isSelected
                    ? 'text-sm font-semibold text-white'
                    : 'text-sm text-gray-700 dark:text-gray-300'
                }
              >
                {t(`${translationKey}.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function JobForm({
  onSubmit,
  onCancel,
  isLoading = false,
  error: externalError,
  initialValues,
  titleKey = 'createTitle',
}: CreateJobFormProps) {
  const { t } = useTranslation('jobs');

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: mapJobPayloadToFormValues(initialValues),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!initialValues) return;

    reset(mapJobPayloadToFormValues(initialValues));
  }, [initialValues, reset]);

  const handleSubmit = async (data: CreateJobFormValues) => {
    const requirements = parseListInput(data.requirementsInput);
    const responsibilities = parseListInput(data.responsibilitiesInput);
    const cultureValuesTags = parseListInput(data.cultureValuesTagsInput ?? '');

    const {
      min: minVal,
      max: maxVal,
      isValidMin,
      isValidMax,
    } = parseSalaryValues(data.salaryMin, data.salaryMax);

    const currency = (data.currency?.trim() || DEFAULT_CURRENCY) as Currency;
    const salary: JobSalary =
      isValidMin || isValidMax
        ? {
            ...(isValidMin && { min: minVal }),
            ...(isValidMax && { max: maxVal }),
            currency,
          }
        : {
            currency: DEFAULT_CURRENCY,
          };

    const payload: CreateJobPayload = {
      title: data.title.trim(),
      description: data.description.trim(),
      company: data.company.trim(),
      companyId: data.companyId,
      companyCulture: {
        name: data.cultureName.trim(),
        logo: data.cultureLogo?.trim() || null,
        workFormat: data.cultureWorkFormat,
        valuesTags: cultureValuesTags,
        growthSpeed: data.cultureGrowthSpeed,
        teamSize: data.cultureTeamSize,
        languages: data.cultureLanguages,
        description: data.cultureDescription.trim(),
      },
      direction: data.direction,
      level: data.level,
      workFormat: data.workFormat,
      location: data.location.trim(),
      salary,
      requirements,
      responsibilities,
      isActive: data.isActive ?? true,
    };

    await onSubmit(payload);
  };

  const displayError = errors.root?.message ?? externalError;

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="mb-6 text-xl font-semibold text-gray-900 dark:text-white"
            accessibilityRole="header"
          >
            {t(titleKey)}
          </Text>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('form.title')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('form.title')}
                autoCapitalize="words"
                error={errors.title?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="company"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('form.company')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('form.company')}
                autoCapitalize="words"
                error={errors.company?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <View className="mb-6 mt-2 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Text className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              {t('companyCulture.title')}
            </Text>

            <Controller
              control={control}
              name="cultureName"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <NamedField
                  label={t('companyCulture.name')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('companyCulture.name')}
                  autoCapitalize="words"
                  error={errors.cultureName?.message}
                  touched={fieldState.isTouched}
                />
              )}
            />

            <Controller
              control={control}
              name="cultureLogo"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <NamedField
                  label={t('companyCulture.logo')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('companyCulture.logoPlaceholder')}
                  autoCapitalize="none"
                  keyboardType="url"
                  error={errors.cultureLogo?.message}
                  touched={fieldState.isTouched}
                />
              )}
            />

            <Controller
              control={control}
              name="cultureWorkFormat"
              render={({ field: { onChange, value } }) => (
                <ChipSelector
                  label={t('companyCulture.workFormat')}
                  options={WORK_FORMAT_OPTIONS}
                  selectedValue={value}
                  onSelect={onChange}
                  translationKey="workFormats"
                  namespace="jobs"
                />
              )}
            />

            <Controller
              control={control}
              name="cultureGrowthSpeed"
              render={({ field: { onChange, value } }) => (
                <ChipSelector
                  label={t('companyCulture.growthSpeed')}
                  options={GROWTH_SPEED_OPTIONS}
                  selectedValue={value}
                  onSelect={onChange}
                  translationKey="growthSpeeds"
                  namespace="jobs"
                />
              )}
            />

            <Controller
              control={control}
              name="cultureTeamSize"
              render={({ field: { onChange, value } }) => (
                <ChipSelector
                  label={t('companyCulture.teamSize')}
                  options={TEAM_SIZE_OPTIONS}
                  selectedValue={value}
                  onSelect={onChange}
                  translationKey="teamSizes"
                  namespace="jobs"
                />
              )}
            />

            <Controller
              control={control}
              name="cultureLanguages"
              render={({ field: { onChange, value } }) => (
                <MultiChipSelector
                  label={t('companyCulture.languages')}
                  options={LANGUAGE_OPTIONS}
                  selectedValues={value}
                  onToggle={(language) => {
                    const nextValue = value.includes(language)
                      ? value.filter((item) => item !== language)
                      : [...value, language];
                    if (nextValue.length > 0) {
                      onChange(nextValue);
                    }
                  }}
                  translationKey="languages"
                />
              )}
            />

            <Controller
              control={control}
              name="cultureValuesTagsInput"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <NamedField
                  label={t('companyCulture.valuesTags')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('companyCulture.valuesTagsPlaceholder')}
                  multiline
                  numberOfLines={3}
                  error={errors.cultureValuesTagsInput?.message}
                  touched={fieldState.isTouched}
                />
              )}
            />

            <Controller
              control={control}
              name="cultureDescription"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <NamedField
                  label={t('companyCulture.description')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('companyCulture.descriptionPlaceholder')}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  error={errors.cultureDescription?.message}
                  touched={fieldState.isTouched}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('form.description')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('form.description')}
                multiline
                numberOfLines={4}
                error={errors.description?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="direction"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('filters.direction')}
                options={DIRECTION_VALUES}
                selectedValue={value}
                onSelect={onChange}
                translationKey="directions"
                namespace="jobs"
              />
            )}
          />

          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('filters.level')}
                options={LEVEL_VALUES}
                selectedValue={value}
                onSelect={onChange}
                translationKey="levels"
                namespace="jobs"
              />
            )}
          />

          <Controller
            control={control}
            name="workFormat"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('filters.workFormat')}
                options={WORK_FORMAT_OPTIONS}
                selectedValue={value}
                onSelect={onChange}
                translationKey="workFormats"
                namespace="jobs"
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('filters.location')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('filters.locationPlaceholder')}
                error={errors.location?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="requirementsInput"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('form.requirements')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('form.requirementsPlaceholder')}
                multiline
                numberOfLines={3}
                error={errors.requirementsInput?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="responsibilitiesInput"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('form.responsibilities')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('form.responsibilitiesPlaceholder')}
                multiline
                numberOfLines={3}
                error={errors.responsibilitiesInput?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <SalaryField
            control={control}
            errors={errors}
            t={t}
            trigger={trigger}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('form.isActive')}
                </Text>
                <Switch
                  value={value ?? true}
                  onValueChange={onChange}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={(value ?? true) ? '#2563eb' : '#f3f4f6'}
                />
              </View>
            )}
          />

          {displayError && (
            <Text className="mb-4 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </Text>
          )}

          <View className="flex-row items-stretch gap-3">
            <View className="flex-1">
              <PrimaryButton
                onPress={onCancel}
                accessibilityLabel={t('form.cancel')}
                className="mb-0 border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                textClassName="text-center text-base font-semibold text-gray-700 dark:text-gray-300"
                disabled={isLoading}
              >
                {t('form.cancel')}
              </PrimaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton
                onPress={rhfHandleSubmit(handleSubmit)}
                disabled={isLoading}
                isLoading={isLoading}
                accessibilityLabel={
                  initialValues ? t('form.update') : t('form.submit')
                }
                className="mb-0"
              >
                {initialValues ? t('form.update') : t('form.submit')}
              </PrimaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
