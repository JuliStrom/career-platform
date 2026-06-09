import {
  CreateJobPayload,
  DEFAULT_CURRENCY,
  type CreateJobFormValues,
  type JobSalary,
} from '@/features/jobs/model';
import {
  Direction,
  GrowthSpeed,
  JobWorkFormat,
  Level,
  TeamSize,
  WorkLanguage,
} from '@/shared/model';
import { formatListInput } from './parse-list.utils';

export function mapJobPayloadToFormValues(
  payload?: Partial<CreateJobPayload>
): CreateJobFormValues {
  return {
    title: payload?.title ?? '',
    description: payload?.description ?? '',
    company: payload?.company ?? '',
    companyId: payload?.companyId,
    cultureName: payload?.companyCulture?.name ?? payload?.company ?? '',
    cultureLogo: payload?.companyCulture?.logo ?? '',
    cultureWorkFormat:
      payload?.companyCulture?.workFormat ?? JobWorkFormat.Office,
    cultureValuesTagsInput: payload?.companyCulture?.valuesTags
      ? formatListInput(payload.companyCulture.valuesTags)
      : '',
    cultureGrowthSpeed:
      payload?.companyCulture?.growthSpeed ?? GrowthSpeed.Medium,
    cultureTeamSize:
      payload?.companyCulture?.teamSize ?? TeamSize.ElevenToFifty,
    cultureLanguages: payload?.companyCulture?.languages ?? [WorkLanguage.RU],
    cultureDescription: payload?.companyCulture?.description ?? '',
    direction: payload?.direction ?? Direction.IT,
    level: payload?.level ?? Level.Junior,
    workFormat: payload?.workFormat ?? JobWorkFormat.Office,
    location: payload?.location ?? '',
    requirementsInput: payload?.requirements
      ? formatListInput(payload.requirements)
      : '',
    responsibilitiesInput: payload?.responsibilities
      ? formatListInput(payload.responsibilities)
      : '',
    salaryMin: payload?.salary?.min?.toString() ?? '',
    salaryMax: payload?.salary?.max?.toString() ?? '',
    currency: payload?.salary?.currency ?? DEFAULT_CURRENCY,
    isActive: payload?.isActive ?? true,
  };
}

export function formatSalary(
  salary: JobSalary,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const { min, max, currency } = salary;
  const hasMin = min !== undefined;
  const hasMax = max !== undefined;

  // Если есть только одно значение или они равны - без тире
  if (!hasMin || !hasMax || min === max) {
    const value = hasMin ? min : max;
    return t('salarySingle', { value, currency });
  }

  // Если есть оба значения и они разные - через тире
  return t('salaryRange', { min, max, currency });
}
