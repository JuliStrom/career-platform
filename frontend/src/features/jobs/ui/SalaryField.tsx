import {
  DEFAULT_CURRENCY,
  type CreateJobFormValues,
} from '@/features/jobs/model';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { normalizeNumberInput } from '@/src/shared/lib/utils/normilizeNumber';
import { useCallback } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  useFormState,
  UseFormTrigger,
} from 'react-hook-form';
import { Text, View } from 'react-native';
import { CurrencyPicker } from './CurrencyPicker';

interface SalaryFieldProps {
  control: Control<CreateJobFormValues>;
  errors: FieldErrors<CreateJobFormValues>;
  t: (key: string, options?: Record<string, unknown>) => string;
  trigger: UseFormTrigger<CreateJobFormValues>;
}

export const SalaryField = ({
  control,
  errors,
  t,
  trigger,
}: SalaryFieldProps) => {
  const { touchedFields, isSubmitted } = useFormState({
    control,
    name: ['salaryMin', 'salaryMax'],
  });

  const isSalaryTouched = !!(
    touchedFields.salaryMin || touchedFields.salaryMax
  );

  const generalError = errors.salaryMin?.message ?? errors.salaryMax?.message;

  const shouldShowError = generalError && (isSalaryTouched || isSubmitted);

  const handleSalaryBlur = useCallback(
    async (onBlur: () => void) => {
      onBlur();
      await trigger(['salaryMin', 'salaryMax']);
    },
    [trigger]
  );

  return (
    <>
      <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('form.salary')}
      </Text>

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1">
          <Controller
            control={control}
            name="salaryMin"
            render={({ field }) => (
              <NamedField
                label={t('form.salaryMin')}
                value={field.value ?? ''}
                onChangeText={(v) => field.onChange(normalizeNumberInput(v))}
                onBlur={() => handleSalaryBlur(field.onBlur)}
                placeholder="0"
                keyboardType="numeric"
                margin="mb-0"
              />
            )}
          />
        </View>

        <View className="flex-1">
          <Controller
            control={control}
            name="salaryMax"
            render={({ field }) => (
              <NamedField
                label={t('form.salaryMax')}
                value={field.value ?? ''}
                onChangeText={(v) => field.onChange(normalizeNumberInput(v))}
                onBlur={() => handleSalaryBlur(field.onBlur)}
                placeholder="0"
                keyboardType="numeric"
                margin="mb-0"
              />
            )}
          />
        </View>

        <View className="w-20">
          <Controller
            control={control}
            name="currency"
            render={({ field, fieldState }) => (
              <CurrencyPicker
                label={t('form.currency')}
                value={field.value ?? DEFAULT_CURRENCY}
                onChange={field.onChange}
              />
            )}
          />
        </View>
      </View>

      {shouldShowError && (
        <Text className="mb-2 text-sm text-red-600 dark:text-red-400">
          {generalError}
        </Text>
      )}
    </>
  );
};
