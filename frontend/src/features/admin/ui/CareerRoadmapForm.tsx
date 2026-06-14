import type {
  CareerRoadmapPayload,
  RoadmapBranchType,
} from '@/features/admin/api/resources.api';
import {
  fetchEducations,
  type EducationResource,
} from '@/features/education/api/education.api';
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
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

const BRANCH_TYPES: RoadmapBranchType[] = [
  'technical',
  'management',
  'entrepreneurship',
];

interface Props {
  initialValues?: CareerRoadmapPayload;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: CareerRoadmapPayload) => Promise<void>;
  onCancel: () => void;
}

export function CareerRoadmapForm({
  initialValues,
  loading,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation('common');
  const [direction, setDirection] = useState<Direction>(DIRECTION_VALUES[0]);
  const [fromLevel, setFromLevel] = useState<Level>(LEVEL_VALUES[0]);
  const [toLevel, setToLevel] = useState<Level>(LEVEL_VALUES[1]);
  const [toRole, setToRole] = useState('');
  const [skills, setSkills] = useState('');
  const [estimatedMonths, setEstimatedMonths] = useState('');
  const [estimatedMonthsMax, setEstimatedMonthsMax] = useState('');
  const [branchType, setBranchType] = useState<RoadmapBranchType>('technical');
  const [careerBranches, setCareerBranches] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<EducationResource[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchEducations()
      .then(setCourses)
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    if (!initialValues) return;
    setDirection(initialValues.direction);
    setFromLevel(initialValues.fromLevel);
    setToLevel(initialValues.toLevel);
    setToRole(initialValues.toRole);
    setSkills(initialValues.skillsToDevelop.join(', '));
    setEstimatedMonths(String(initialValues.estimatedTimeMonths));
    setEstimatedMonthsMax(
      initialValues.estimatedTimeMonthsMax == null
        ? ''
        : String(initialValues.estimatedTimeMonthsMax)
    );
    setBranchType(initialValues.branchType);
    setCareerBranches(initialValues.careerBranches.join(', '));
    setSelectedCourseIds(initialValues.learningResourceIds ?? []);
    setSortOrder(String(initialValues.sortOrder));
    setIsActive(initialValues.isActive);
  }, [initialValues]);

  function parseList(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function toggleCourse(id: string) {
    setSelectedCourseIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleSubmit() {
    const parsedSkills = parseList(skills);
    const months = Number(estimatedMonths);
    const monthsMax =
      estimatedMonthsMax.trim() === '' ? null : Number(estimatedMonthsMax);
    const order = Number(sortOrder);

    if (
      !toRole.trim() ||
      parsedSkills.length === 0 ||
      !Number.isInteger(months) ||
      months < 1 ||
      (monthsMax !== null &&
        (!Number.isInteger(monthsMax) || monthsMax < months)) ||
      !Number.isInteger(order) ||
      order < 0
    ) {
      setValidationError(t('adminCareerRoadmaps.required'));
      return;
    }

    setValidationError(null);
    await onSubmit({
      direction,
      fromLevel,
      toLevel,
      toRole: toRole.trim(),
      skillsToDevelop: parsedSkills,
      estimatedTimeMonths: months,
      estimatedTimeMonthsMax: monthsMax,
      branchType,
      careerBranches: parseList(careerBranches),
      learningResourceIds: selectedCourseIds,
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
        label={t('adminCareerRoadmaps.direction')}
        options={DIRECTION_VALUES}
        selectedValue={direction}
        onSelect={setDirection}
        translationKey="directions"
        namespace="career"
      />
      <ChipSelector
        label={t('adminCareerRoadmaps.fromLevel')}
        options={LEVEL_VALUES}
        selectedValue={fromLevel}
        onSelect={setFromLevel}
        translationKey="levels"
        namespace="career"
      />
      <ChipSelector
        label={t('adminCareerRoadmaps.toLevel')}
        options={LEVEL_VALUES}
        selectedValue={toLevel}
        onSelect={setToLevel}
        translationKey="levels"
        namespace="career"
      />
      <NamedField
        label={t('adminCareerRoadmaps.toRole')}
        value={toRole}
        onChangeText={setToRole}
        editable={!loading}
      />
      <NamedField
        label={t('adminCareerRoadmaps.skills')}
        value={skills}
        onChangeText={setSkills}
        placeholder={t('adminCareerRoadmaps.commaSeparated')}
        multiline
        numberOfLines={3}
        editable={!loading}
      />
      <NamedField
        label={t('adminCareerRoadmaps.estimatedMonths')}
        value={estimatedMonths}
        onChangeText={setEstimatedMonths}
        keyboardType="number-pad"
        editable={!loading}
      />
      <NamedField
        label={t('adminCareerRoadmaps.estimatedMonthsMax')}
        value={estimatedMonthsMax}
        onChangeText={setEstimatedMonthsMax}
        keyboardType="number-pad"
        editable={!loading}
      />
      <ChipSelector
        label={t('adminCareerRoadmaps.branchType')}
        options={BRANCH_TYPES}
        selectedValue={branchType}
        onSelect={setBranchType}
        translationKey="adminCareerRoadmaps.branchTypes"
        namespace="common"
      />
      <NamedField
        label={t('adminCareerRoadmaps.careerBranches')}
        value={careerBranches}
        onChangeText={setCareerBranches}
        placeholder={t('adminCareerRoadmaps.commaSeparated')}
        multiline
        numberOfLines={2}
        editable={!loading}
      />
      <Text className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
        {t('adminCareerRoadmaps.courses')}
      </Text>
      <Text className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {t('adminCareerRoadmaps.coursesHint')}
      </Text>
      <View className="mb-4 gap-2">
        {coursesLoading ? (
          <Text className="text-sm text-gray-500">{t('loading')}</Text>
        ) : courses.length === 0 ? (
          <Text className="text-sm text-gray-500">
            {t('adminCareerRoadmaps.noCourses')}
          </Text>
        ) : (
          courses.map((course) => {
            const selected = selectedCourseIds.includes(course._id);
            return (
              <Pressable
                key={course._id}
                onPress={() => toggleCourse(course._id)}
                className={`rounded-lg border p-3 ${
                  selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {[course.provider, course.direction, course.level]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
      <NamedField
        label={t('adminCareerRoadmaps.sortOrder')}
        value={sortOrder}
        onChangeText={setSortOrder}
        keyboardType="number-pad"
        editable={!loading}
      />
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('adminCareerRoadmaps.isActive')}
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
