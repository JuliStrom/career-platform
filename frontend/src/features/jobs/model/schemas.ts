import { parseSalaryValues } from '@/features/jobs/utils/validation.utils';
import { getValidationMessage } from '@/shared/lib/utils';
import { Direction, JobWorkFormat, Level } from '@/shared/model';
import { z } from 'zod';
import {
  DIRECTION_FILTER_VALUES,
  LEVEL_FILTER_VALUES,
  WORK_FORMAT_FILTER_VALUES,
} from './constants';

const getJobValidationMessage = (key: string) =>
  getValidationMessage(key, 'jobs');

export const CURRENCIES = ['USD', 'EUR', 'RUB'] as const;
export const DEFAULT_CURRENCY = 'USD' as const;
export type Currency = (typeof CURRENCIES)[number];

const jobSalaryObjectSchema = z
  .object({
    min: z
      .number()
      .min(0, getJobValidationMessage('salaryMinNegative'))
      .optional(),
    max: z
      .number()
      .min(0, getJobValidationMessage('salaryMaxNegative'))
      .optional(),
    currency: z
      .enum(CURRENCIES, {
        message: getJobValidationMessage('currencyInvalid'),
      })
      .default(DEFAULT_CURRENCY),
  })
  .refine(
    (data) => {
      if (data && data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
      return true;
    },
    {
      message: getJobValidationMessage('salaryMinGreaterThanMax'),
    }
  );

const baseJobSchema = z.object({
  title: z
    .string()
    .min(1, getJobValidationMessage('titleRequired'))
    .max(200, getJobValidationMessage('titleMax')),
  description: z
    .string()
    .min(20, getJobValidationMessage('descriptionMin'))
    .max(5000, getJobValidationMessage('descriptionMax')),
  company: z
    .string()
    .min(1, getJobValidationMessage('companyRequired'))
    .max(200, getJobValidationMessage('companyMax')),
  direction: z.enum(Direction),
  level: z.enum(Level),
  workFormat: z.enum(JobWorkFormat),
  location: z
    .string()
    .min(1, getJobValidationMessage('locationRequired'))
    .max(200, getJobValidationMessage('locationMax')),
  isActive: z.boolean().optional().default(true),
});

export const createJobSchema = baseJobSchema.extend({
  salary: jobSalaryObjectSchema,
  requirements: z
    .array(
      z
        .string()
        .min(1)
        .max(500, getJobValidationMessage('requirementItemMax'))
        .trim()
    )
    .min(1, getJobValidationMessage('requirementsRequired')),
  responsibilities: z
    .array(
      z
        .string()
        .min(1)
        .max(500, getJobValidationMessage('responsibilityItemMax'))
        .trim()
    )
    .min(1, getJobValidationMessage('responsibilitiesRequired')),
});

export const createJobFormSchema = baseJobSchema
  .extend({
    requirementsInput: z.string().refine(
      (val) => {
        const parsed = val
          .split(/[,،،\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        return parsed.length > 0;
      },
      { message: getJobValidationMessage('requirementsRequired') }
    ),
    responsibilitiesInput: z.string().refine(
      (val) => {
        const parsed = val
          .split(/[,،،\n]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        return parsed.length > 0;
      },
      { message: getJobValidationMessage('responsibilitiesRequired') }
    ),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    currency: z
      .enum(CURRENCIES, {
        message: getJobValidationMessage('currencyInvalid'),
      })
      .default(DEFAULT_CURRENCY),
  })
  .refine(
    (data) => {
      if (!data.salaryMin && !data.salaryMax) return true;

      const { min, max, isValidMin, isValidMax } = parseSalaryValues(
        data.salaryMin,
        data.salaryMax
      );

      if (data.salaryMin && !data.salaryMax) {
        return isValidMin;
      }

      if (!data.salaryMin && data.salaryMax) {
        return isValidMax;
      }

      if (data.salaryMin && data.salaryMax) {
        if (!isValidMin || !isValidMax) return false;
        if (min !== undefined && max !== undefined) {
          return min <= max;
        }
      }

      return true;
    },
    {
      message: getJobValidationMessage('salaryMinGreaterThanMax'),
      path: ['salaryMax'],
    }
  );

export const jobsFiltersFormSchema = z.object({
  direction: z.enum(DIRECTION_FILTER_VALUES).optional(),
  level: z.enum(LEVEL_FILTER_VALUES).optional(),
  workFormat: z.enum(WORK_FORMAT_FILTER_VALUES).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  isInternational: z.boolean().optional(),
});

export type JobsFiltersFormValues = z.infer<typeof jobsFiltersFormSchema>;

export type JobSalary = z.infer<typeof jobSalaryObjectSchema>;
export type CreateJobSchema = z.infer<typeof createJobSchema>;
export type CreateJobPayload = CreateJobSchema;
export type CreateJobFormValues = z.input<typeof createJobFormSchema>;
