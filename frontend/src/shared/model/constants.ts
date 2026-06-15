import {
  CareerChangeAgeRange,
  CareerChangeMotivation,
  CareerChangeTimeline,
  City,
  Direction,
  EmploymentType,
  GrowthSpeed,
  JobWorkFormat,
  Level,
  ProfileLang,
  TeamSize,
  WorkLanguage,
} from './enums';

export const DIRECTION_VALUES = Object.values(Direction) as Direction[];
export const CAREER_CHANGE_AGE_RANGE_VALUES = Object.values(
  CareerChangeAgeRange
) as CareerChangeAgeRange[];
export const CAREER_CHANGE_AGE_WITH_SKIP = [
  ...CAREER_CHANGE_AGE_RANGE_VALUES,
  'skip',
] as const;
export type CareerChangeAgeOption =
  | CareerChangeAgeRange
  | (typeof CAREER_CHANGE_AGE_WITH_SKIP)[number];
export const CAREER_CHANGE_MOTIVATION_VALUES = Object.values(
  CareerChangeMotivation
) as CareerChangeMotivation[];
export const CAREER_CHANGE_TIMELINE_VALUES = Object.values(
  CareerChangeTimeline
) as CareerChangeTimeline[];
export const LEVEL_VALUES = Object.values(Level) as Level[];
export const JOB_WORK_FORMATS = Object.values(JobWorkFormat);
export const GROWTH_SPEED_VALUES = Object.values(GrowthSpeed) as GrowthSpeed[];
export const TEAM_SIZE_VALUES = Object.values(TeamSize) as TeamSize[];
export const WORK_LANGUAGE_VALUES = Object.values(
  WorkLanguage
) as WorkLanguage[];
export const CITY_VALUES = Object.values(City) as City[];
export const EMPLOYMENT_TYPE_VALUES = Object.values(
  EmploymentType
) as EmploymentType[];
export const PROFILE_LANG_VALUES = Object.values(ProfileLang) as ProfileLang[];
