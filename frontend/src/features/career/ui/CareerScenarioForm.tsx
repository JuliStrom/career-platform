import {
  CreateCareerScenarioPayload,
  createCareerScenarioSchema,
} from '@/features/career/model';
import type { z } from 'zod';
import { ACTION_TYPE_VALUES } from '@/features/career/model/constants';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { DIRECTION_VALUES, LEVEL_VALUES } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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

interface CareerScenarioFormProps {
  onSubmit: (values: CreateCareerScenarioPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  initialValues?: Partial<CreateCareerScenarioPayload>;
  titleKey?: string;
  /** Ключ перевода для основной кнопки (по умолчанию «Создать») */
  submitLabelKey?: string;
}

export function CareerScenarioForm({
  onSubmit,
  onCancel,
  isLoading = false,
  error: externalError,
  initialValues,
  titleKey = 'createTitle',
  submitLabelKey = 'form.submit',
}: CareerScenarioFormProps) {
  const { t } = useTranslation('career');

  type CareerScenarioFormInput = z.input<typeof createCareerScenarioSchema>;
  type CareerScenarioFormOutput = z.output<typeof createCareerScenarioSchema>;

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    reset,
  } = useForm<CareerScenarioFormInput, unknown, CareerScenarioFormOutput>({
    resolver: zodResolver(createCareerScenarioSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      direction: initialValues?.direction,
      level: initialValues?.level,
      isActive: initialValues?.isActive ?? true,
      actions: initialValues?.actions ?? [
        {
          type: ACTION_TYPE_VALUES[0],
          title: '',
          description: '',
          link: '',
        },
      ],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  useEffect(() => {
    if (!initialValues) return;

    reset({
      title: initialValues.title ?? '',
      description: initialValues.description ?? '',
      direction: initialValues.direction,
      level: initialValues.level,
      isActive: initialValues.isActive ?? true,
      actions: initialValues.actions ?? [
        {
          type: ACTION_TYPE_VALUES[0],
          title: '',
          description: '',
          link: '',
        },
      ],
    });
  }, [initialValues, reset]);

  const handleSubmit = async (data: CreateCareerScenarioPayload) => {
    const payload: CreateCareerScenarioPayload = {
      title: data.title.trim(),
      description: data.description.trim(),
      direction: data.direction,
      level: data.level,
      isActive: data.isActive ?? true,
      actions: data.actions.map((action) => {
        const linkTrim = action.link?.trim();
        return {
          type: action.type,
          title: action.title.trim(),
          description: action.description.trim(),
          link: linkTrim ? linkTrim : undefined,
        };
      }),
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
                label={t('form.direction')}
                options={DIRECTION_VALUES}
                selectedValue={value!}
                onSelect={onChange}
                translationKey="directions"
                namespace="profile"
              />
            )}
          />

          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <ChipSelector
                label={t('form.level')}
                options={LEVEL_VALUES}
                selectedValue={value!}
                onSelect={onChange}
                translationKey="levels"
                namespace="profile"
              />
            )}
          />

          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4 flex-row items-center justify-between">
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

          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('form.actions')}
              </Text>
              <Pressable
                onPress={() =>
                  append({
                    type: ACTION_TYPE_VALUES[0],
                    title: '',
                    description: '',
                    link: '',
                  })
                }
                className="rounded-lg bg-blue-600 px-3 py-1.5 dark:bg-blue-500"
                accessibilityRole="button"
              >
                <Text className="text-sm font-semibold text-white">
                  {t('form.addAction')}
                </Text>
              </Pressable>
            </View>

            {errors.actions && (
              <Text className="mb-2 text-sm text-red-600 dark:text-red-400">
                {typeof errors.actions.message === 'string'
                  ? errors.actions.message
                  : errors.actions.root?.message ||
                    t('validation.actionsRequired')}
              </Text>
            )}

            {fields.map((field, index) => (
              <View
                key={field.id}
                className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {t('form.actionTitle')} {index + 1}
                  </Text>
                  {fields.length > 1 && (
                    <Pressable
                      onPress={() => remove(index)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 dark:bg-red-500"
                      accessibilityRole="button"
                      accessibilityLabel={t('form.removeAction')}
                    >
                      <Text className="text-sm font-semibold text-white">
                        {t('form.removeAction')}
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Controller
                  control={control}
                  name={`actions.${index}.type`}
                  render={({ field: { onChange, value } }) => (
                    <ChipSelector
                      label={t('form.actionType')}
                      options={ACTION_TYPE_VALUES}
                      selectedValue={value}
                      onSelect={onChange}
                      translationKey="actionTypes"
                      namespace="career"
                      classNameSelector="mb-3"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`actions.${index}.title`}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <NamedField
                      label={t('form.actionTitle')}
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('form.actionTitle')}
                      autoCapitalize="words"
                      error={errors.actions?.[index]?.title?.message}
                      touched={fieldState.isTouched}
                      margin="mb-3"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`actions.${index}.description`}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <NamedField
                      label={t('form.actionDescription')}
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('form.actionDescription')}
                      multiline
                      numberOfLines={3}
                      error={errors.actions?.[index]?.description?.message}
                      touched={fieldState.isTouched}
                      margin="mb-3"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`actions.${index}.link`}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <NamedField
                      label={t('form.actionLink')}
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('form.actionLink')}
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                      error={errors.actions?.[index]?.link?.message}
                      touched={fieldState.isTouched}
                    />
                  )}
                />
              </View>
            ))}
          </View>

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
                accessibilityLabel={t(submitLabelKey)}
                className="mb-0"
              >
                {t(submitLabelKey)}
              </PrimaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
