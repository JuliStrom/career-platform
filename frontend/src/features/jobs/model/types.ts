import { UserRole, Direction, JobWorkFormat, Level } from '@/shared/model';

import type {
  DIRECTION_FILTER_VALUES,
  LEVEL_FILTER_VALUES,
  WORK_FORMAT_FILTER_VALUES,
} from './constants';
import type { CreateJobSchema } from './schemas';

export interface JobAuthor {
  _id: string;
  email: string;
  role: UserRole;
}

export interface Job extends CreateJobSchema {
  _id: string;
  /** Может отсутствовать у вакансий, загруженных в БД без автора */
  createdBy?: JobAuthor | null;
  createdAt: string;
  updatedAt: string;
}

export interface IJobsFilters {
  direction?: Direction;
  level?: Level;
  workFormat?: JobWorkFormat;
  location?: string;
  /** Подстрока по title, description, company (бэкенд GET /jobs?search=) */
  search?: string;
  isInternational?: boolean;
  page?: number;
  limit?: number;
}

export type DirectionFilterValue = (typeof DIRECTION_FILTER_VALUES)[number];
export type LevelFilterValue = (typeof LEVEL_FILTER_VALUES)[number];
export type WorkFormatFilterValue = (typeof WORK_FORMAT_FILTER_VALUES)[number];

export interface JobsListResponse {
  total: number;
  jobs: Job[];
}

export interface FavoriteJobsResponse {
  total: number;
  favoriteJobs: Job[];
}

export interface FavoriteActionResponse {
  message: string;
  favoriteJobsCount: number;
}
