import { DIRECTION_VALUES, LEVEL_VALUES } from '@/shared/model';
import { ActionType } from './enums';

export const ACTION_TYPE_VALUES = Object.values(ActionType) as ActionType[];
export const DIRECTION_FILTER_VALUES = ['All', ...DIRECTION_VALUES] as const;
export const LEVEL_FILTER_VALUES = ['All', ...LEVEL_VALUES] as const;
export const IS_ACTIVE_FILTER_VALUES = ['All', 'Active', 'Inactive'] as const;
