import { z } from 'zod';
import { GrowthSpeed, TeamSize, WorkFormat, WorkLanguage } from '../types';
import { objectIdSchema } from './common.schema';

const workFormatValues = Object.values(WorkFormat) as [string, ...string[]];
const growthSpeedValues = Object.values(GrowthSpeed) as [string, ...string[]];
const teamSizeValues = Object.values(TeamSize) as [string, ...string[]];
const workLanguageValues = Object.values(WorkLanguage) as [string, ...string[]];

export const companyCardSchema = z.object({
  name: z.string().trim().min(1).max(200),
  logo: z.union([z.literal(''), z.string().url()]).optional().nullable(),
  workFormat: z.enum(workFormatValues),
  valuesTags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  growthSpeed: z.enum(growthSpeedValues),
  teamSize: z.enum(teamSizeValues),
  languages: z.array(z.enum(workLanguageValues)).min(1),
  description: z.string().trim().min(1).max(300),
});

export const adminCompanyIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createAdminCompanySchema = z.object({
  body: companyCardSchema,
});

export const updateAdminCompanySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: companyCardSchema.partial().refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required',
  }),
});
