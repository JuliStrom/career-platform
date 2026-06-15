import type {
  DirectionFilterValue,
  IJobsFilters,
  JobsFiltersFormValues,
  LevelFilterValue,
  WorkFormatFilterValue,
} from '@/features/jobs/model';
import { jobsFiltersFormSchema } from '@/features/jobs/model/schemas';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { FilterSecondaryButton } from '@/shared/ui/buttons/FilterSecondaryButton';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import {
  DIRECTION_FILTER_VALUES,
  LEVEL_FILTER_VALUES,
  WORK_FORMAT_FILTER_VALUES,
} from '../model/constants';
import { Checkbox } from '@/shared/ui/checkbox/Checkbox';

interface JobsFiltersProps {
  filters: IJobsFilters;
  isLoading: boolean;
  onChange: (partial: Partial<IJobsFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

export function JobsFilters({
  filters,
  isLoading,
  onChange,
  onApply,
  onReset,
}: JobsFiltersProps) {
  const { t } = useTranslation('jobs');

  const [isExpanded, setIsExpanded] = useState(false);

  const { control, handleSubmit, reset } = useForm<JobsFiltersFormValues>({
    resolver: zodResolver(jobsFiltersFormSchema),
    defaultValues: {
      direction: filters.direction ?? 'All',
      level: filters.level ?? 'All',
      workFormat: filters.workFormat ?? 'All',
      location: filters.location ?? '',
      search: filters.search ?? '',
      isInternational: filters.isInternational ?? false,
    },
    mode: 'onChange',
  });

  const watchedValues = useWatch({ control });
  const watchedDirection = watchedValues.direction ?? 'All';
  const watchedLevel = watchedValues.level ?? 'All';
  const watchedWorkFormat = watchedValues.workFormat ?? 'All';
  const watchedLocation = watchedValues.location ?? '';
  const watchedSearch = watchedValues.search ?? '';
  const watchedIsInternational = watchedValues.isInternational ?? false;

  useEffect(() => {
    reset({
      direction: filters.direction ?? 'All',
      level: filters.level ?? 'All',
      workFormat: filters.workFormat ?? 'All',
      location: filters.location ?? '',
      search: filters.search ?? '',
      isInternational: filters.isInternational ?? false,
    });
  }, [filters, reset]);

  const activeCount =
    (watchedDirection !== 'All' ? 1 : 0) +
    (watchedLevel !== 'All' ? 1 : 0) +
    (watchedWorkFormat !== 'All' ? 1 : 0) +
    (watchedLocation ? 1 : 0) +
    (watchedSearch.trim() ? 1 : 0) +
    (watchedIsInternational ? 1 : 0);

  const handleFormSubmit = (data: JobsFiltersFormValues) => {
    const search = data.search?.trim();
    const partial: Partial<IJobsFilters> = {
      direction: data.direction === 'All' ? undefined : data.direction,
      level: data.level === 'All' ? undefined : data.level,
      workFormat: data.workFormat === 'All' ? undefined : data.workFormat,
      location: data.location?.trim(),
      search: search || undefined,
      isInternational: data.isInternational || undefined,
    };
    onChange(partial);
    onApply();
  };

  const handleReset = () => {
    reset({
      direction: 'All',
      level: 'All',
      workFormat: 'All',
      location: '',
      search: '',
    });
    onReset();
  };

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        className="flex-row items-center justify-between"
        accessibilityRole="button"
        accessibilityLabel={t('filters.title')}
      >
        <View className="flex-row items-center">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('filters.title')}
          </Text>
          {activeCount > 0 && (
            <Text className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
              {activeCount}
            </Text>
          )}
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {isExpanded ? (
            <MaterialIcons name="arrow-drop-up" size={30} color="black" />
          ) : (
            <MaterialIcons name="arrow-drop-down" size={30} color="black" />
          )}
        </Text>
      </Pressable>

      {isExpanded && (
        <>
          <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t('filters.hint')}
          </Text>

          <View className="mt-3">
            <Controller
              control={control}
              name="direction"
              render={({ field: { onChange, value } }) => (
                <ChipSelector<DirectionFilterValue>
                  label={t('filters.direction')}
                  options={DIRECTION_FILTER_VALUES}
                  selectedValue={value ?? 'All'}
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
                <ChipSelector<LevelFilterValue>
                  label={t('filters.level')}
                  options={LEVEL_FILTER_VALUES}
                  selectedValue={value ?? 'All'}
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
                <ChipSelector<WorkFormatFilterValue>
                  label={t('filters.workFormat')}
                  options={WORK_FORMAT_FILTER_VALUES}
                  selectedValue={value ?? 'All'}
                  onSelect={onChange}
                  translationKey="workFormats"
                  namespace="jobs"
                />
              )}
            />
            <Controller
              control={control}
              name="isInternational"
              render={({ field: { onChange, value } }) => (
                <View className="mt-3">
                  <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('filters.abroad')}
                  </Text>

                  <Checkbox value={Boolean(value)} onChange={onChange} />
                </View>
              )}
            />
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <NamedField
                  label={t('filters.location')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('filters.locationPlaceholder')}
                />
              )}
            />

            <Controller
              control={control}
              name="search"
              render={({ field: { onChange, onBlur, value } }) => (
                <NamedField
                  label={t('filters.search')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('filters.searchPlaceholder')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  margin="mt-3"
                />
              )}
            />
          </View>

          <View className="mt-1 flex-row gap-2">
            <View className="min-w-0 flex-1">
              <PrimaryButton
                onPress={handleSubmit(handleFormSubmit)}
                accessibilityLabel={t('filters.apply')}
                className="mb-0 w-full"
                isLoading={isLoading}
              >
                {t('filters.apply')}
              </PrimaryButton>
            </View>
            <View className="min-w-0 flex-1">
              <FilterSecondaryButton
                label={t('filters.reset')}
                onPress={handleReset}
                accessibilityLabel={t('filters.reset')}
                className="w-full"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
