import type { CareerRoutePayload } from '@/features/admin/api/resources.api';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import { DIRECTION_VALUES, type Direction } from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

interface Props {
  initialValues?: CareerRoutePayload;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: CareerRoutePayload) => Promise<void>;
  onCancel: () => void;
}

function listToInput(value: unknown): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean).join(', ');
  }

  return String(value);
}

function inputToList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CareerRouteForm({
  initialValues,
  loading,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState('');
  const [direction, setDirection] = useState<Direction>(DIRECTION_VALUES[0]);
  const [fromCity, setFromCity] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [steps, setSteps] = useState('');
  const [resources, setResources] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title);
    setDirection(initialValues.direction);
    setFromCity(initialValues.fromCity ?? '');
    setToCountry(initialValues.toCountry);
    setSteps(listToInput(initialValues.steps));
    setResources(listToInput(initialValues.resources));
    setIsFeatured(initialValues.isFeatured);
  }, [initialValues]);

  async function handleSubmit() {
    if (!title.trim() || !toCountry.trim()) {
      setValidationError(t('adminRoutes.required'));
      return;
    }

    setValidationError(null);
    await onSubmit({
      title: title.trim(),
      direction,
      fromCity: fromCity.trim() || null,
      toCountry: toCountry.trim(),
      steps: inputToList(steps),
      resources: inputToList(resources),
      isFeatured,
    });
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <NamedField
        label={t('adminRoutes.title')}
        value={title}
        onChangeText={setTitle}
        editable={!loading}
      />
      <ChipSelector
        label={t('adminRoutes.direction')}
        options={DIRECTION_VALUES}
        selectedValue={direction}
        onSelect={setDirection}
        translationKey="directions"
        namespace="career"
      />
      <NamedField
        label={t('adminRoutes.fromCity')}
        value={fromCity}
        onChangeText={setFromCity}
        editable={!loading}
      />
      <NamedField
        label={t('adminRoutes.toCountry')}
        value={toCountry}
        onChangeText={setToCountry}
        editable={!loading}
      />
      <NamedField
        label={t('adminRoutes.steps')}
        value={steps}
        onChangeText={setSteps}
        multiline
        numberOfLines={3}
        autoCapitalize="none"
        placeholder={t('adminRoutes.stepsPlaceholder')}
        editable={!loading}
      />
      <NamedField
        label={t('adminRoutes.resources')}
        value={resources}
        onChangeText={setResources}
        multiline
        numberOfLines={3}
        autoCapitalize="none"
        placeholder={t('adminRoutes.resourcesPlaceholder')}
        editable={!loading}
      />
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('adminRoutes.isFeatured')}
        </Text>
        <Switch
          value={isFeatured}
          onValueChange={setIsFeatured}
          disabled={loading}
        />
      </View>
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
