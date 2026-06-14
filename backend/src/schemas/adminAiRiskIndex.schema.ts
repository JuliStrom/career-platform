import { z } from 'zod';
import { AiRiskLevel, Direction, Level } from '../types';
import { objectIdSchema } from './common.schema';

const directionValues = Object.values(Direction) as [string, ...string[]];
const levelValues = Object.values(Level) as [string, ...string[]];
const riskLevelValues = Object.values(AiRiskLevel) as [string, ...string[]];

export const aiRiskIndexBodySchema = z.object({
  direction: z.enum(directionValues),
  level: z.enum(levelValues),
  riskLevel: z.enum(riskLevelValues),
  riskScore: z.number().min(0).max(100),
  riskDescription: z.string().trim().min(1).max(2000),
  protectiveSkills: z
    .array(z.string().trim().min(1).max(100))
    .min(3)
    .max(8),
});

export const adminAiRiskIndexIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createAdminAiRiskIndexSchema = z.object({
  body: aiRiskIndexBodySchema,
});

export const updateAdminAiRiskIndexSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: aiRiskIndexBodySchema,
});
