import type {
  CareerTriggerCta,
  CareerTriggerPayload,
  CareerTriggerSpecialCase,
} from '@/features/admin/api/resources.api';
import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import {
  DIRECTION_VALUES,
  LEVEL_VALUES,
  type Direction,
  type Level,
} from '@/shared/model';
import { PrimaryButton } from '@/shared/ui/buttons/PrimaryButton';
import { NamedField } from '@/shared/ui/inputs/NamedField';
import { ChipSelector } from '@/shared/ui/selectors/ChipSelector';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

const ANY = 'any' as const;
const NONE = 'none' as const;
const CTA_VALUES: CareerTriggerCta[] = ['consultation', 'roadmap', 'courses'];
const SPECIAL_CASE_VALUES: CareerTriggerSpecialCase[] = [
  'career_change_retraining',
  'reskilling_track_40',
];
const DIRECTION_OPTIONS = [ANY, ...DIRECTION_VALUES] as const;
const LEVEL_OPTIONS = [ANY, ...LEVEL_VALUES] as const;
const SPECIAL_CASE_OPTIONS = [NONE, ...SPECIAL_CASE_VALUES] as const;

interface Props {
  initialValues?: CareerTriggerPayload;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: CareerTriggerPayload) => Promise<void>;
  onCancel: () => void;
}

export function CareerTriggerForm({
  initialValues,
  loading,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation('common');
  const [direction, setDirection] = useState<Direction | typeof ANY>(ANY);
  const [currentLevel, setCurrentLevel] = useState<Level | typeof ANY>(ANY);
  const [minYears, setMinYears] = useState('');
  const [triggerTitle, setTriggerTitle] = useState('');
  const [triggerDescription, setTriggerDescription] = useState('');
  const [ctaType, setCtaType] = useState<CareerTriggerCta>('consultation');
  const [specialCase, setSpecialCase] = useState<
    CareerTriggerSpecialCase | typeof NONE
  >(NONE);
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [stepTitles, setStepTitles] = useState(['', '', '']);
  const [stepDescriptions, setStepDescriptions] = useState(['', '', '']);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) return;
    setDirection(initialValues.direction ?? ANY);
    setCurrentLevel(initialValues.currentLevel ?? ANY);
    setMinYears(
      initialValues.minYears == null ? '' : String(initialValues.minYears)
    );
    setTriggerTitle(initialValues.triggerTitle);
    setTriggerDescription(initialValues.triggerDescription);
    setCtaType(initialValues.ctaType);
    setSpecialCase(initialValues.specialCase ?? NONE);
    setSortOrder(String(initialValues.sortOrder));
    setIsActive(initialValues.isActive);
    setStepTitles(
      Array.from(
        { length: 3 },
        (_, index) => initialValues.nextSteps[index]?.title ?? ''
      )
    );
    setStepDescriptions(
      Array.from(
        { length: 3 },
        (_, index) => initialValues.nextSteps[index]?.description ?? ''
      )
    );
  }, [initialValues]);

  function updateStep(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) {
    setter((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item))
    );
  }

  async function handleSubmit() {
    const years = minYears.trim() === '' ? null : Number(minYears);
    const order = Number(sortOrder);

    if (
      !triggerTitle.trim() ||
      !triggerDescription.trim() ||
      stepTitles.some((title) => !title.trim()) ||
      (years !== null && (!Number.isFinite(years) || years < 0)) ||
      !Number.isInteger(order)
    ) {
      setValidationError(t('adminCareerTriggers.required'));
      return;
    }

    setValidationError(null);
    await onSubmit({
      direction: direction === ANY ? null : direction,
      currentLevel: currentLevel === ANY ? null : currentLevel,
      minYears: years,
      triggerTitle: triggerTitle.trim(),
      triggerDescription: triggerDescription.trim(),
      nextSteps: stepTitles.map((title, index) => ({
        title: title.trim(),
        ...(stepDescriptions[index].trim() && {
          description: stepDescriptions[index].trim(),
        }),
      })),
      ctaType,
      ...(specialCase !== NONE && { specialCase }),
      isActive,
      sortOrder: order,
    });
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <ChipSelector
        label={t('adminCareerTriggers.direction')}
        options={DIRECTION_OPTIONS}
        selectedValue={direction}
        onSelect={setDirection}
        translationKey="adminCareerTriggers.directions"
        namespace="common"
      />
      <ChipSelector
        label={t('adminCareerTriggers.currentLevel')}
        options={LEVEL_OPTIONS}
        selectedValue={currentLevel}
        onSelect={setCurrentLevel}
        translationKey="adminCareerTriggers.levels"
        namespace="common"
      />
      <NamedField
        label={t('adminCareerTriggers.minYears')}
        value={minYears}
        onChangeText={setMinYears}
        keyboardType="decimal-pad"
        editable={!loading}
      />
      <NamedField
        label={t('adminCareerTriggers.triggerTitle')}
        value={triggerTitle}
        onChangeText={setTriggerTitle}
        editable={!loading}
      />
      <NamedField
        label={t('adminCareerTriggers.triggerDescription')}
        value={triggerDescription}
        onChangeText={setTriggerDescription}
        multiline
        numberOfLines={4}
        editable={!loading}
      />
      <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
        {t('adminCareerTriggers.nextSteps')}
      </Text>
      {stepTitles.map((title, index) => (
        <View
          key={index}
          className="mb-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <NamedField
            label={`${t('adminCareerTriggers.stepTitle')} ${index + 1}`}
            value={title}
            onChangeText={(value) => updateStep(setStepTitles, index, value)}
            editable={!loading}
          />
          <NamedField
            label={t('adminCareerTriggers.stepDescription')}
            value={stepDescriptions[index]}
            onChangeText={(value) =>
              updateStep(setStepDescriptions, index, value)
            }
            multiline
            numberOfLines={2}
            margin="mb-0"
            editable={!loading}
          />
        </View>
      ))}
      <ChipSelector
        label={t('adminCareerTriggers.ctaType')}
        options={CTA_VALUES}
        selectedValue={ctaType}
        onSelect={setCtaType}
        translationKey="adminCareerTriggers.ctaTypes"
        namespace="common"
      />
      <ChipSelector
        label={t('adminCareerTriggers.specialCase')}
        options={SPECIAL_CASE_OPTIONS}
        selectedValue={specialCase}
        onSelect={setSpecialCase}
        translationKey="adminCareerTriggers.specialCases"
        namespace="common"
      />
      <NamedField
        label={t('adminCareerTriggers.sortOrder')}
        value={sortOrder}
        onChangeText={setSortOrder}
        keyboardType="number-pad"
        editable={!loading}
      />
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('adminCareerTriggers.isActive')}
        </Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
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
