import {
  City,
  Direction,
  EmployerBudgetRange,
  EmployerContactKind,
  EmployerTaskType,
  EmploymentType,
  GrowthSpeed,
  JobWorkFormat,
  Level,
  SpecialistWorkFormat,
  TeamSize,
  WorkLanguage,
} from '@/shared/model';
import type { CreateJobPayload, Job } from '@/features/jobs/model';

export interface Company {
  _id: string;
  name: string;
  logo?: string | null;
  workFormat: JobWorkFormat;
  valuesTags: string[];
  growthSpeed: GrowthSpeed;
  teamSize: TeamSize;
  languages: WorkLanguage[];
  description: string;
}

export type CompanyPayload = Omit<Company, '_id'>;

export type EmployerJobPayload = Omit<
  CreateJobPayload,
  'company' | 'companyId' | 'companyCulture'
>;

export type CreateEmployerJobPayload = Omit<EmployerJobPayload, 'isActive'>;

export interface EmployerJobsResponse {
  jobs: Job[];
  total: number;
}

export interface EmployerProfile {
  id: string;
  name: string;
  description: string;
  industry: Direction;
  taskType: EmployerTaskType;
  budgetRange?: EmployerBudgetRange | null;
}

export type EmployerProfilePayload = {
  name: string;
  description: string;
  industry: Direction;
  taskType: EmployerTaskType;
  budgetRange?: EmployerBudgetRange | null;
};

export interface SpecialistCard {
  id: string;
  name: string;
  aboutMe?: string | null;
  directions: Direction[];
  level: Level;
  skills: string[];
  careerGoal: string;
  city: City | null;
  employmentType: EmploymentType | null;
  experience?: string | null;
  currentCompany?: string | null;
  wantsRelocation?: boolean;
  relocationToCountry?: string | null;
}

export interface SpecialistFilters {
  direction?: Direction;
  level?: Level;
  city?: City;
  format?: SpecialistWorkFormat;
}

export interface SpecialistsResponse {
  items: SpecialistCard[];
  total: number;
  page: number;
  limit: number;
}

export type ContactSpecialistPayload = {
  kind: EmployerContactKind;
  message?: string;
};
