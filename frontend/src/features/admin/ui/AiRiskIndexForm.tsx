import type {
  AiRiskIndexPayload,
  AiRiskLevel,
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
import { ScrollView, Text, View } from 'react-native';

const RISK_LEVEL_VALUES: AiRiskLevel[] = ['low', 'medium', 'high'];

interface Props {
  initialValues?: AiRiskIndexPayload;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: AiRiskIndexPayload) => Promise<void>;
  onCancel: () => void;
}

export function AiRiskIndexForm({
  initialValues,
  loading,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation('common');
  const [direction, setDirection] = useState<Direction>(DIRECTION_VALUES[0]);
  const [level, setLevel] = useState<Level>(LEVEL_VALUES[0]);
  const [riskLevel, setRiskLevel] = useState<AiRiskLevel>('low');
  const [riskScore, setRiskScore] = useState('');
  const [riskDescription, setRiskDescription] = useState('');
  const [protectiveSkills, setProtectiveSkills] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) return;
    setDirection(initialValues.direction);
    setLevel(initialValues.level);
    setRiskLevel(initialValues.riskLevel);
    setRiskScore(String(initialValues.riskScore));
    setRiskDescription(initialValues.riskDescription);
    setProtectiveSkills(initialValues.protectiveSkills.join(', '));
  }, [initialValues]);

  async function handleSubmit() {
    const score = Number(riskScore);
    const skills = protectiveSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (
      !riskDescription.trim() ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100 ||
      skills.length < 3 ||
      skills.length > 8
    ) {
      setValidationError(t('adminAiRisk.required'));
      return;
    }

    setValidationError(null);
    await onSubmit({
      direction,
      level,
      riskLevel,
      riskScore: score,
      riskDescription: riskDescription.trim(),
      protectiveSkills: skills,
    });
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <ChipSelector
        label={t('adminAiRisk.direction')}
        options={DIRECTION_VALUES}
        selectedValue={direction}
        onSelect={setDirection}
        translationKey="directions"
        namespace="career"
      />
      <ChipSelector
        label={t('adminAiRisk.level')}
        options={LEVEL_VALUES}
        selectedValue={level}
        onSelect={setLevel}
        translationKey="levels"
        namespace="career"
      />
      <ChipSelector
        label={t('adminAiRisk.riskLevel')}
        options={RISK_LEVEL_VALUES}
        selectedValue={riskLevel}
        onSelect={setRiskLevel}
        translationKey="adminAiRisk.riskLevels"
      />
      <NamedField
        label={t('adminAiRisk.riskScore')}
        value={riskScore}
        onChangeText={setRiskScore}
        keyboardType="numeric"
        editable={!loading}
      />
      <NamedField
        label={t('adminAiRisk.riskDescription')}
        value={riskDescription}
        onChangeText={setRiskDescription}
        multiline
        numberOfLines={5}
        editable={!loading}
      />
      <NamedField
        label={t('adminAiRisk.protectiveSkills')}
        value={protectiveSkills}
        onChangeText={setProtectiveSkills}
        placeholder={t('adminAiRisk.protectiveSkillsPlaceholder')}
        multiline
        numberOfLines={3}
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
