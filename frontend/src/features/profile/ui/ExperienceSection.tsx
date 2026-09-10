import type { ProfileFormValues } from '@/features/profile/model';
import {
  MAX_EXPERIENCE_PROJECTS,
  MAX_WORKPLACES,
  emptyExperienceProject,
  emptyWorkplace,
  localizePeriodDisplay,
} from '@/features/profile/utils/experience.utils';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldPath,
  useFieldArray,
  type UseFormGetValues,
} from 'react-hook-form';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ExperienceSectionProps {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  getValues: UseFormGetValues<ProfileFormValues>;
}

const cellInputClassName =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

function ProjectBlock({
  control,
  errors,
  name,
  index,
  onRemove,
}: {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  name: 'projects' | `workplaces.${number}.projects`;
  index: number;
  onRemove: () => void;
}) {
  const { t } = useTranslation('profile');
  const [expanded, setExpanded] = useState(true);
  const heading = t('projectItem', { index: index + 1 });

  const projectError = (field: 'name' | 'role' | 'result' | 'link') => {
    if (name === 'projects') {
      return errors.projects?.[index]?.[field]?.message;
    }
    const workplaceIndex = Number(name.split('.')[1]);
    return errors.workplaces?.[workplaceIndex]?.projects?.[index]?.[field]?.message;
  };

  return (
    <View className="mb-2 rounded-lg border border-gray-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
      <View className="flex-row items-center justify-between gap-2">
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          className="min-w-0 flex-1 flex-row items-center gap-1"
          accessibilityRole="button"
          accessibilityLabel={expanded ? t('collapseProject') : t('expandProject')}
        >
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={22}
            color="#6B7280"
          />
          <Text
            className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300"
            numberOfLines={1}
          >
            {heading}
          </Text>
        </Pressable>
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={t('removeProject')}
        >
          <Text className="text-xs text-red-600 dark:text-red-400">
            {t('removeProject')}
          </Text>
        </Pressable>
      </View>
      {expanded ? (
        <View className="mt-2">
          <View className="mb-2 flex-row gap-2">
            <View className="min-w-[120px] flex-1">
              <Controller
                control={control}
                name={`${name}.${index}.name` as FieldPath<ProfileFormValues>}
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <NamedField
                    label=""
                    value={typeof value === 'string' ? value : ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('projectNamePlaceholder')}
                    margin="mb-0"
                    inputClassName={cellInputClassName}
                    error={projectError('name')}
                    touched={fieldState.isTouched}
                  />
                )}
              />
            </View>
            <View className="min-w-[120px] flex-1">
              <Controller
                control={control}
                name={`${name}.${index}.role` as FieldPath<ProfileFormValues>}
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <NamedField
                    label=""
                    value={typeof value === 'string' ? value : ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('projectRolePlaceholder')}
                    margin="mb-0"
                    inputClassName={cellInputClassName}
                    error={projectError('role')}
                    touched={fieldState.isTouched}
                  />
                )}
              />
            </View>
          </View>
          <View className="mb-2">
            <Controller
              control={control}
              name={`${name}.${index}.result` as FieldPath<ProfileFormValues>}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <NamedField
                  label=""
                  value={typeof value === 'string' ? value : ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('projectResultPlaceholder')}
                  margin="mb-0"
                  inputClassName={cellInputClassName}
                  error={projectError('result')}
                  touched={fieldState.isTouched}
                />
              )}
            />
          </View>
          <Controller
            control={control}
            name={`${name}.${index}.link` as FieldPath<ProfileFormValues>}
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <NamedField
                label=""
                value={typeof value === 'string' ? value : ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('projectLinkPlaceholder')}
                autoCapitalize="none"
                margin="mb-0"
                inputClassName={cellInputClassName}
                error={projectError('link')}
                touched={fieldState.isTouched}
              />
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

function ProjectsEditor({
  control,
  errors,
  getValues,
  name,
}: {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  getValues: UseFormGetValues<ProfileFormValues>;
  name: 'projects' | `workplaces.${number}.projects`;
}) {
  const { t } = useTranslation('profile');
  const projects = useFieldArray({ control, name });

  return (
    <View className="mt-2 w-full pl-2">
      {projects.fields.map((field, index) => (
        <ProjectBlock
          key={field.id}
          control={control}
          errors={errors}
          name={name}
          index={index}
          onRemove={() => projects.remove(index)}
        />
      ))}
      {projects.fields.length < MAX_EXPERIENCE_PROJECTS ? (
        <Pressable
          onPress={() => {
            const current = getValues(name) ?? [];
            projects.replace([
              ...current.map((project) => ({
                name: project?.name ?? '',
                role: project?.role ?? '',
                result: project?.result ?? '',
                link: project?.link ?? '',
              })),
              emptyExperienceProject(),
            ]);
          }}
          accessibilityRole="button"
        >
          <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {t('addProject')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ExperienceSection({
  control,
  errors,
  getValues,
}: ExperienceSectionProps) {
  const { t } = useTranslation('profile');
  const workplaces = useFieldArray({ control, name: 'workplaces' });

  const addWorkplace = () => {
    const current = getValues('workplaces') ?? [];
    workplaces.replace([
      ...current.map((item) => ({
        company: item?.company ?? '',
        position: item?.position ?? '',
        period: item?.period ?? '',
        achievement: item?.achievement ?? '',
        projects: (item?.projects ?? []).map((project) => ({
          name: project?.name ?? '',
          role: project?.role ?? '',
          result: project?.result ?? '',
          link: project?.link ?? '',
        })),
      })),
      emptyWorkplace(),
    ]);
  };

  return (
    <View className="mb-6">
      <View className="mb-2 flex-row flex-wrap items-center justify-between gap-3">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('experience')}
        </Text>
        {workplaces.fields.length < MAX_WORKPLACES ? (
          <Pressable
            onPress={addWorkplace}
            accessibilityRole="button"
            accessibilityLabel={t('addWorkplace')}
          >
            <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('addWorkplace')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {t('experienceHint')}
      </Text>
      <View className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {typeof errors.workplaces?.message === 'string' ? (
          <Text className="mb-2 text-sm text-red-600 dark:text-red-400">
            {errors.workplaces.message}
          </Text>
        ) : null}

        <View className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
          <View className="flex-row gap-2 bg-gray-50 px-3 py-2 dark:bg-gray-900">
            <Text className="w-40 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('workplacePeriod')}
            </Text>
            <Text className="min-w-[120px] flex-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('workplaceCompany')}
            </Text>
            <Text className="min-w-[120px] flex-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('workplacePosition')}
            </Text>
            <Text className="min-w-[160px] flex-[1.4] text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('workplaceAchievement')}
            </Text>
            <View className="w-14" />
          </View>

          {workplaces.fields.map((field, index) => (
            <View
              key={field.id}
              className="border-t border-gray-100 px-3 py-2 dark:border-gray-700"
            >
              <View className="flex-row flex-wrap items-start gap-2">
                <View className="w-40">
                  <Controller
                    control={control}
                    name={`workplaces.${index}.period`}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <NamedField
                        label=""
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('workplacePeriodPlaceholder')}
                        margin="mb-0"
                        inputClassName={cellInputClassName}
                        error={errors.workplaces?.[index]?.period?.message}
                        touched={fieldState.isTouched}
                      />
                    )}
                  />
                </View>
                <View className="min-w-[120px] flex-1">
                  <Controller
                    control={control}
                    name={`workplaces.${index}.company`}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <NamedField
                        label=""
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('workplaceCompanyPlaceholder')}
                        margin="mb-0"
                        inputClassName={cellInputClassName}
                        error={errors.workplaces?.[index]?.company?.message}
                        touched={fieldState.isTouched}
                      />
                    )}
                  />
                </View>
                <View className="min-w-[120px] flex-1">
                  <Controller
                    control={control}
                    name={`workplaces.${index}.position`}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <NamedField
                        label=""
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('workplacePositionPlaceholder')}
                        margin="mb-0"
                        inputClassName={cellInputClassName}
                        error={errors.workplaces?.[index]?.position?.message}
                        touched={fieldState.isTouched}
                      />
                    )}
                  />
                </View>
                <View className="min-w-[160px] flex-[1.4]">
                  <Controller
                    control={control}
                    name={`workplaces.${index}.achievement`}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <NamedField
                        label=""
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('workplaceAchievementPlaceholder')}
                        margin="mb-0"
                        inputClassName={cellInputClassName}
                        error={errors.workplaces?.[index]?.achievement?.message}
                        touched={fieldState.isTouched}
                      />
                    )}
                  />
                </View>
                {workplaces.fields.length > 1 ? (
                  <Pressable
                    onPress={() => workplaces.remove(index)}
                    className="h-10 w-14 justify-center"
                    accessibilityRole="button"
                    accessibilityLabel={t('removeWorkplace')}
                  >
                    <Text className="text-sm text-red-600 dark:text-red-400">
                      {t('removeWorkplace')}
                    </Text>
                  </Pressable>
                ) : (
                  <View className="w-14" />
                )}
              </View>
              <ProjectsEditor
                control={control}
                errors={errors}
                getValues={getValues}
                name={`workplaces.${index}.projects`}
              />
            </View>
          ))}

          <View className="border-t border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <View className="flex-row flex-wrap items-start gap-2">
              <View className="w-40">
                <Controller
                  control={control}
                  name="careerStartDateInput"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <NamedField
                      label=""
                      value={localizePeriodDisplay(value ?? '')}
                      onChangeText={(text) => onChange(localizePeriodDisplay(text))}
                      onBlur={onBlur}
                      placeholder={t('careerStartDatePlaceholder')}
                      margin="mb-0"
                      inputClassName={cellInputClassName}
                      error={errors.careerStartDateInput?.message}
                      touched={fieldState.isTouched}
                    />
                  )}
                />
              </View>
              <View className="min-w-[120px] flex-1">
                <Controller
                  control={control}
                  name="currentCompany"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <NamedField
                      label=""
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('currentCompanyPlaceholder')}
                      margin="mb-0"
                      inputClassName={cellInputClassName}
                      error={errors.currentCompany?.message}
                      touched={fieldState.isTouched}
                    />
                  )}
                />
              </View>
              <View className="min-w-[120px] flex-1">
                <Controller
                  control={control}
                  name="currentPosition"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <NamedField
                      label=""
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('workplacePositionPlaceholder')}
                      margin="mb-0"
                      inputClassName={cellInputClassName}
                      error={errors.currentPosition?.message}
                      touched={fieldState.isTouched}
                    />
                  )}
                />
              </View>
              <View className="min-w-[160px] flex-[1.4]">
                <Controller
                  control={control}
                  name="currentAchievement"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <NamedField
                      label=""
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={t('workplaceAchievementPlaceholder')}
                      margin="mb-0"
                      inputClassName={cellInputClassName}
                      error={errors.currentAchievement?.message}
                      touched={fieldState.isTouched}
                    />
                  )}
                />
              </View>
              <View className="w-14" />
            </View>
            <ProjectsEditor
              control={control}
              errors={errors}
              getValues={getValues}
              name="projects"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
