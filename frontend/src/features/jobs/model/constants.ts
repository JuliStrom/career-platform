import {
  DIRECTION_VALUES,
  JOB_WORK_FORMATS,
  LEVEL_VALUES,
} from '@/src/shared/model';

export const DIRECTION_FILTER_VALUES = ['All', ...DIRECTION_VALUES] as const;
export const LEVEL_FILTER_VALUES = ['All', ...LEVEL_VALUES] as const;
export const WORK_FORMAT_FILTER_VALUES = ['All', ...JOB_WORK_FORMATS] as const;
