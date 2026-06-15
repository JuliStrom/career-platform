/**
 * Блок 5 ТЗ — трек «Меняю профессию» (35–50+).
 * Значения в API — стабильные snake_case строки.
 */

export enum CareerChangeAgeRange {
  UP_TO_30 = 'up_to_30',
  FROM_30_TO_40 = '30_40',
  FROM_40_TO_50 = '40_50',
  FROM_50_PLUS = '50_plus',
}

export enum CareerChangeMotivation {
  AI_THREAT = 'ai_threat',
  EARN_MORE = 'earn_more',
  REMOTE = 'remote',
  BURNOUT = 'burnout',
  OTHER = 'other',
}

export enum CareerChangeTimeline {
  UP_TO_6_MONTHS = 'up_to_6_months',
  MONTHS_6_12 = '6_12_months',
  YEARS_1_2 = '1_2_years',
  JUST_STUDYING = 'just_studying',
}

/** Теги learning_resources для подбора контента хаба */
export const CAREER_CHANGE_RESOURCE_TAGS = {
  HUB: 'career_change',
  FROM_SCRATCH: 'from_scratch',
  INTERNSHIP_KZ: 'internship_kz',
  INTERNSHIP_ABROAD: 'internship_abroad',
  GOVERNMENT_PROGRAM: 'government_program',
  SUCCESS_STORY: 'success_story',
} as const;
