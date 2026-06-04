import type { EducationResource } from '@/features/education/api/education.api';
import {
  formatEducationSkillsTags,
  formatKztPrice,
} from '@/features/education/model';
import { EducationBadge } from '@/features/education/ui/EducationBadge';
import { EducationField } from '@/features/education/ui/EducationField';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';

interface EducationCardProps {
  education: EducationResource;
  t: (key: string) => string;
  translateDirection: (direction: string) => string;
}

export function EducationCard({
  education,
  t,
  translateDirection,
}: EducationCardProps) {
  const emptyValue = t('educations.emptyValue');
  const price =
    education.price === 0
      ? t('educations.free')
      : education.price == null
        ? emptyValue
        : formatKztPrice(education.price);
  const skillsTags = formatEducationSkillsTags(
    education.skillsTags,
    emptyValue
  );
  const programUrl = education.url?.trim() || null;

  return (
    <View className="mb-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="self-start rounded-md bg-emerald-50 px-2 py-1 dark:bg-emerald-900/30">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {education.title}
            </Text>
          </View>
          {education.provider ? (
            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {education.provider}
            </Text>
          ) : null}
        </View>
        {education.isFeatured ? (
          <View className="rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/40">
            <Text className="text-xs font-semibold text-blue-700 dark:text-blue-200">
              {t('educations.isFeatured')}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <EducationBadge value={education.type || emptyValue} />
        <EducationBadge value={education.locationType || emptyValue} />
        <EducationBadge
          value={
            education.direction
              ? translateDirection(education.direction)
              : emptyValue
          }
        />
        <EducationBadge value={education.level || emptyValue} />
      </View>

      <View className="mt-3">
        <EducationField
          label={t('educations.city')}
          value={education.city || emptyValue}
          emptyValue={emptyValue}
        />
        <EducationField
          label={t('educations.country')}
          value={education.country || emptyValue}
          emptyValue={emptyValue}
        />
        <EducationField
          label={t('educations.durationWeeks')}
          value={
            education.durationWeeks == null
              ? emptyValue
              : String(education.durationWeeks)
          }
          emptyValue={emptyValue}
        />
        <EducationField
          label={t('educations.price')}
          value={price}
          emptyValue={emptyValue}
        />
        <EducationField
          label={t('educations.skillsTags')}
          value={skillsTags}
          emptyValue={emptyValue}
        />
      </View>

      {programUrl ? (
        <Pressable
          onPress={() => WebBrowser.openBrowserAsync(programUrl)}
          className="mt-3 flex-row items-center justify-center rounded-lg bg-blue-600 px-3 py-2 active:opacity-80 dark:bg-blue-500"
          accessibilityRole="link"
          accessibilityLabel={t('educations.openProgram')}
        >
          <MaterialIcons name="open-in-new" size={18} color="#ffffff" />
          <Text className="ml-2 text-sm font-semibold text-white">
            {t('educations.openProgram')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
