import { z } from 'zod';
import {
  CareerTriggerCta,
  CareerTriggerSpecialCase,
  Direction,
  Level,
} from '../types';
import { objectIdSchema } from './common.schema';

const directionValues = Object.values(Direction) as [string, ...string[]];
const levelValues = Object.values(Level) as [string, ...string[]];
const ctaValues = Object.values(CareerTriggerCta) as [string, ...string[]];
const specialCaseValues = Object.values(CareerTriggerSpecialCase) as [
  string,
  ...string[],
];

const nextStepSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(1000).optional(),
});

export const careerTriggerBodySchema = z.object({
  direction: z.enum(directionValues).nullable(),
  currentLevel: z.enum(levelValues).nullable(),
  minYears: z.number().min(0).nullable(),
  triggerTitle: z.string().trim().min(1).max(300),
  triggerDescription: z.string().trim().min(1).max(2000),
  nextSteps: z.array(nextStepSchema).length(3),
  ctaType: z.enum(ctaValues),
  specialCase: z.enum(specialCaseValues).optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export const adminCareerTriggerIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createAdminCareerTriggerSchema = z.object({
  body: careerTriggerBodySchema,
});

export const updateAdminCareerTriggerSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: careerTriggerBodySchema,
});
