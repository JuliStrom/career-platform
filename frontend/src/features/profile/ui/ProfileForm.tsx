import {
  CAREER_GOAL_VALUES,
  CAREER_CHANGE_AGE_WITH_SKIP,
  CAREER_CHANGE_MOTIVATION_VALUES,
  CAREER_CHANGE_TIMELINE_VALUES,
  CareerChangeMotivation,
  CareerChangeTimeline,
  CareerGoal,
  CITY_VALUES,
  City,
  Direction,
  EMPLOYMENT_TYPE_VALUES,
  EmploymentType,
  Level,
  Profile,
  PROFILE_LANG_VALUES,
  ProfileLang,
  profileFormSchema,
  DIRECTION_VALUES,
  LEVEL_VALUES,
  type ProfileFormValues,
} from '@/features/profile/model';
import {
  formatSkillsInput,
  parseSkillsInput,
} from '@/features/profile/utils/skills.utils';
import { ProfileAvatarUpload } from '@/features/profile/ui/ProfileAvatarUpload';
import { setLanguage } from '@/shared/config/i18n';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileFormProps {
  initialValues?: Profile;
  onSubmit: (values: Profile) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  submitButtonText: string;
  submitButtonLabel: string;
  title: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  cancelButtonText?: string;
  onDeleteAvatar?: () => Promise<void>;
  isDeletingAvatar?: boolean;
}

const RELOCATION_TO_COUNTRY_VALUES = [
  'usa',
  'canada',
  'germany',
  'russia',
  'china',
  'dubai',
  'europe',
  'other',
] as const;

const RELOCATION_FROM_VALUES = ['kazakhstan'] as const;

export function ProfileForm({
  initialValues,
  onSubmit,
  isLoading = false,
  error: externalError,
  submitButtonText,
  submitButtonLabel,
  title,
  showCancelButton = false,
  onCancel,
  cancelButtonText,
  onDeleteAvatar,
  isDeletingAvatar = false,
}: ProfileFormProps) {
  const { t } = useTranslation('profile');

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      avatar: initialValues?.avatar ?? '',
      direction: initialValues?.direction ?? Direction.IT,
      level: initialValues?.level ?? Level.Junior,
      skillsInput: initialValues ? formatSkillsInput(initialValues.skills) : '',
      experience: initialValues?.experience ?? '',
      careerGoal: initialValues?.careerGoal ?? CareerGoal.Growth,
      careerStartDateInput: initialValues?.careerStartDate
        ? new Date(initialValues.careerStartDate).toISOString().slice(0, 10)
        : '',
      currentCompany: initialValues?.currentCompany ?? '',
      city: initialValues?.city ?? null,
      relocationFromCity: initialValues?.relocationFromCity ?? null,
      relocationToCountry: initialValues?.relocationToCountry ?? null,
      employmentType: initialValues?.employmentType ?? null,
      lang: initialValues?.lang ?? ProfileLang.RU,
      wantsRelocation: initialValues?.wantsRelocation ?? false,
      careerChangeTrackActive: initialValues?.careerChangeTrackActive ?? false,
      careerChangeCurrentField: initialValues?.careerChangeCurrentField ?? '',
      careerChangeTargetDirection:
        initialValues?.careerChangeTargetDirection ?? Direction.IT,
      careerChangeAgeRange:
        initialValues?.careerChangeAgeRange != null
          ? initialValues.careerChangeAgeRange
          : 'skip',
      careerChangeMotivation:
        initialValues?.careerChangeMotivation ?? CareerChangeMotivation.Other,
      careerChangeTimeline:
        initialValues?.careerChangeTimeline ??
        CareerChangeTimeline.JustStudying,
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!initialValues) return;

    reset({
      ...initialValues,
      avatar: initialValues.avatar ?? '',
      skillsInput: formatSkillsInput(initialValues.skills),
      careerStartDateInput: initialValues.careerStartDate
        ? new Date(initialValues.careerStartDate).toISOString().slice(0, 10)
        : '',
      currentCompany: initialValues.currentCompany ?? '',
      city: initialValues.city ?? null,
      relocationFromCity: initialValues.relocationFromCity ?? null,
      relocationToCountry: initialValues.relocationToCountry ?? null,
      employmentType: initialValues.employmentType ?? null,
      lang: initialValues.lang ?? ProfileLang.RU,
      wantsRelocation: initialValues.wantsRelocation ?? false,
      careerChangeTrackActive: initialValues.careerChangeTrackActive ?? false,
      careerChangeCurrentField: initialValues.careerChangeCurrentField ?? '',
      careerChangeTargetDirection:
        initialValues.careerChangeTargetDirection ?? Direction.IT,
      careerChangeAgeRange:
        initialValues.careerChangeAgeRange != null
          ? initialValues.careerChangeAgeRange
          : 'skip',
      careerChangeMotivation:
        initialValues.careerChangeMotivation ?? CareerChangeMotivation.Other,
      careerChangeTimeline:
        initialValues.careerChangeTimeline ?? CareerChangeTimeline.JustStudying,
    });
  }, [initialValues, reset]);

  const watchedName = useWatch({ control, name: 'name', defaultValue: '' });
  const watchedCity = useWatch({ control, name: 'city', defaultValue: null });
  const careerChangeTrackActive = useWatch({
    control,
    name: 'careerChangeTrackActive',
    defaultValue: false,
  });
  const baselineServerAvatar = initialValues?.avatar?.trim() ?? '';

  const handleSubmit = async (data: ProfileFormValues) => {
    const skills = parseSkillsInput(data.skillsInput);

    const payload: Profile = {
      name: data.name.trim(),
      avatar:
        typeof data.avatar === 'string' && data.avatar.trim()
          ? data.avatar.trim()
          : undefined,
      direction: data.direction,
      level: data.level,
      skills,
      experience: data.experience.trim(),
      careerGoal: data.careerGoal,
      careerStartDate:
        data.careerStartDateInput && data.careerStartDateInput.trim().length > 0
          ? data.careerStartDateInput
          : null,
      currentCompany:
        data.currentCompany && data.currentCompany.trim().length > 0
          ? data.currentCompany.trim()
          : null,
      city: data.city ?? null,
      relocationFromCity:
        data.city === City.Abroad
          ? (data.relocationFromCity ?? 'kazakhstan')
          : null,
      relocationToCountry:
        data.city === City.Abroad
          ? (data.relocationToCountry ?? 'europe')
          : null,
      employmentType: data.employmentType ?? null,
      lang: data.lang ?? ProfileLang.RU,
      wantsRelocation: Boolean(data.wantsRelocation),
      careerChangeTrackActive: Boolean(data.careerChangeTrackActive),
      careerChangeCurrentField: data.careerChangeTrackActive
        ? (data.careerChangeCurrentField ?? '').trim()
        : '',
      careerChangeTargetDirection: data.careerChangeTrackActive
        ? data.careerChangeTargetDirection!
        : undefined,
      careerChangeAgeRange:
        !data.careerChangeTrackActive ||
        data.careerChangeAgeRange === 'skip' ||
        data.careerChangeAgeRange == null
          ? 'skip'
          : data.careerChangeAgeRange,
      careerChangeMotivation: data.careerChangeTrackActive
        ? data.careerChangeMotivation!
        : undefined,
      careerChangeTimeline: data.careerChangeTrackActive
        ? data.careerChangeTimeline!
        : undefined,
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
            {title}
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('name')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('name')}
                autoCapitalize="words"
                error={errors.name?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="avatar"
            render={({ field: { onChange, value }, fieldState }) => (
              <ProfileAvatarUpload
                value={typeof value === 'string' ? value : ''}
                onChange={onChange}
                baselineServerAvatar={baselineServerAvatar}
                displayName={typeof watchedName === 'string' ? watchedName : ''}
                disabled={isLoading}
                isDeleting={isDeletingAvatar}
                onDeleteServerAvatar={onDeleteAvatar}
                fieldError={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="direction"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('direction')}
                options={DIRECTION_VALUES}
                selectedValue={value}
                onSelect={onChange}
                translationKey="directions"
              />
            )}
          />

          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('level')}
                options={LEVEL_VALUES}
                selectedValue={value}
                onSelect={onChange}
                translationKey="levels"
              />
            )}
          />

          <Controller
            control={control}
            name="skillsInput"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('skills')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('skillsPlaceholder')}
                error={errors.skillsInput?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="experience"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('experience')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('experience')}
                multiline
                numberOfLines={4}
                margin="mb-4"
                error={errors.experience?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="careerGoal"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('careerGoal')}
                options={CAREER_GOAL_VALUES}
                selectedValue={value}
                onSelect={onChange}
                translationKey="careerGoals"
                classNameSelector="mb-6"
              />
            )}
          />

          <Controller
            control={control}
            name="careerStartDateInput"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('careerStartDate')}
                </Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    aria-label={t('careerStartDate')}
                    style={{
                      width: '100%',
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderStyle: 'solid',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                ) : (
                  <NamedField
                    label=""
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('careerStartDatePlaceholder')}
                    margin="mb-0"
                    error={errors.careerStartDateInput?.message}
                    touched={fieldState.isTouched}
                  />
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="currentCompany"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label={t('currentCompany')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('currentCompanyPlaceholder')}
                error={errors.currentCompany?.message}
                touched={fieldState.isTouched}
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('city')}
                options={CITY_VALUES}
                selectedValue={(value ?? City.Almaty) as City}
                onSelect={onChange}
                translationKey="cities"
              />
            )}
          />

          {watchedCity === City.Abroad ? (
            <View className="mb-4 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
              <Controller
                control={control}
                name="relocationFromCity"
                render={({ field: { onChange, value } }) => (
                  <ChipSelector
                    label={t('relocationFromCity')}
                    options={RELOCATION_FROM_VALUES}
                    selectedValue={value ?? 'kazakhstan'}
                    onSelect={onChange}
                    translationKey="relocationOrigins"
                    classNameSelector="mb-4"
                  />
                )}
              />
              <Controller
                control={control}
                name="relocationToCountry"
                render={({ field: { onChange, value } }) => (
                  <ChipSelector
                    label={t('relocationToCountry')}
                    options={RELOCATION_TO_COUNTRY_VALUES}
                    selectedValue={value ?? 'europe'}
                    onSelect={onChange}
                    translationKey="relocationCountries"
                    classNameSelector="mb-0"
                  />
                )}
              />
            </View>
          ) : null}

          <Controller
            control={control}
            name="employmentType"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('employmentType')}
                options={EMPLOYMENT_TYPE_VALUES}
                selectedValue={
                  (value ?? EmploymentType.Fulltime) as EmploymentType
                }
                onSelect={onChange}
                translationKey="employmentTypes"
              />
            )}
          />

          <Controller
            control={control}
            name="lang"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('profileLang')}
                options={PROFILE_LANG_VALUES}
                selectedValue={(value ?? ProfileLang.RU) as ProfileLang}
                onSelect={(selected) => {
                  const lang = selected as ProfileLang;
                  onChange(lang);
                  void setLanguage(lang);
                }}
                translationKey="profileLangs"
              />
            )}
          />

          <Controller
            control={control}
            name="wantsRelocation"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('wantsRelocation')}
                options={['true', 'false']}
                selectedValue={value ? 'true' : 'false'}
                onSelect={(selected) => onChange(selected === 'true')}
                translationKey="relocationOptions"
              />
            )}
          />

          <View className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/80 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
            <Text className="mb-1 text-base font-semibold text-indigo-950 dark:text-indigo-100">
              {t('careerChange.sectionTitle')}
            </Text>
            <Text className="mb-4 text-sm leading-5 text-indigo-900/90 dark:text-indigo-200/90">
              {t('careerChange.sectionHint')}
            </Text>
            <Controller
              control={control}
              name="careerChangeTrackActive"
              render={({ field: { value, onChange } }) => (
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="mr-3 flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {t('careerChange.toggleLabel')}
                  </Text>
                  <Switch
                    accessibilityLabel={t('careerChange.toggleLabel')}
                    value={value}
                    onValueChange={onChange}
                  />
                </View>
              )}
            />
            {careerChangeTrackActive ? (
              <>
                <Controller
                  control={control}
                  name="careerChangeCurrentField"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <NamedField
                      label={t('careerChange.currentField')}
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('careerChange.currentFieldPlaceholder')}
                      margin="mb-4"
                      error={errors.careerChangeCurrentField?.message}
                      touched={fieldState.isTouched}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="careerChangeTargetDirection"
                  render={({ field: { onChange, value } }) => (
                    <ChipSelector
                      label={t('careerChange.targetDirection')}
                      options={DIRECTION_VALUES}
                      selectedValue={value ?? Direction.IT}
                      onSelect={onChange}
                      translationKey="directions"
                      classNameSelector="mb-4"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="careerChangeAgeRange"
                  render={({ field: { onChange, value } }) => (
                    <ChipSelector
                      label={t('careerChange.ageRange')}
                      options={[...CAREER_CHANGE_AGE_WITH_SKIP]}
                      selectedValue={value ?? 'skip'}
                      onSelect={onChange}
                      translationKey="careerChange.ageRanges"
                      classNameSelector="mb-4"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="careerChangeMotivation"
                  render={({ field: { onChange, value } }) => (
                    <ChipSelector
                      label={t('careerChange.motivation')}
                      options={CAREER_CHANGE_MOTIVATION_VALUES}
                      selectedValue={value ?? CareerChangeMotivation.Other}
                      onSelect={onChange}
                      translationKey="careerChange.motivations"
                      classNameSelector="mb-4"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="careerChangeTimeline"
                  render={({ field: { onChange, value } }) => (
                    <ChipSelector
                      label={t('careerChange.timeline')}
                      options={CAREER_CHANGE_TIMELINE_VALUES}
                      selectedValue={value ?? CareerChangeTimeline.JustStudying}
                      onSelect={onChange}
                      translationKey="careerChange.timelines"
                      classNameSelector="mb-4"
                    />
                  )}
                />
              </>
            ) : null}
          </View>

          {displayError && (
            <Text className="mb-4 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </Text>
          )}

          <View className="flex-row items-stretch gap-3">
            {showCancelButton && (
              <View className="flex-1">
                <PrimaryButton
                  onPress={onCancel}
                  accessibilityLabel={cancelButtonText}
                  className="mb-0 border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                  textClassName="text-center text-base font-semibold text-gray-700 dark:text-gray-300"
                  disabled={isLoading}
                >
                  {cancelButtonText}
                </PrimaryButton>
              </View>
            )}
            <View className="flex-1">
              <PrimaryButton
                onPress={rhfHandleSubmit(handleSubmit)}
                disabled={isLoading}
                isLoading={isLoading}
                accessibilityLabel={submitButtonLabel}
                className="mb-0"
              >
                {submitButtonText}
              </PrimaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
