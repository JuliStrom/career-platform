import { getValidationMessage } from '@/shared/lib/utils';
import { Direction, Level } from '@/shared/model';
import { z } from 'zod';
import {
  ACTION_TYPE_VALUES,
  DIRECTION_FILTER_VALUES,
  IS_ACTIVE_FILTER_VALUES,
  LEVEL_FILTER_VALUES,
} from './constants';

const getCareerValidationMessage = (key: string) =>
  getValidationMessage(key, 'career');

const trimmedNonEmptyString = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v) => (v == null ? '' : String(v)).trim());

const careerScenarioActionSchema = z.object({
  type: z.enum([...ACTION_TYPE_VALUES] as [string, ...string[]], {
    message: getCareerValidationMessage('actionTypeInvalid'),
  }),
  title: trimmedNonEmptyString.pipe(
    z
      .string()
      .min(3, getCareerValidationMessage('actionTitleMin'))
      .max(200, getCareerValidationMessage('actionTitleMax'))
  ),
  description: trimmedNonEmptyString.pipe(
    z
      .string()
      .min(10, getCareerValidationMessage('actionDescriptionMin'))
      .max(1000, getCareerValidationMessage('actionDescriptionMax'))
  ),
  link: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s === '' ? undefined : s;
    })
    .pipe(
      z
        .union([
          z.undefined(),
          z.string().url({
            message: getCareerValidationMessage('actionLinkInvalid'),
          }),
        ])
    ),
});

export const createCareerScenarioSchema = z.object({
  direction: z.enum(Direction, {
    message: getCareerValidationMessage('directionInvalid'),
  }),
  level: z.enum(Level, {
    message: getCareerValidationMessage('levelInvalid'),
  }),
  title: z
    .string()
    .min(5, getCareerValidationMessage('titleMin'))
    .max(200, getCareerValidationMessage('titleMax'))
    .trim(),
  description: z
    .string()
    .min(20, getCareerValidationMessage('descriptionMin'))
    .max(5000, getCareerValidationMessage('descriptionMax'))
    .trim(),
  actions: z
    .array(careerScenarioActionSchema)
    .min(1, getCareerValidationMessage('actionsRequired')),
  isActive: z.boolean().optional(),
});

export const scenariosFiltersFormSchema = z.object({
  direction: z
    .enum([...DIRECTION_FILTER_VALUES] as [string, ...string[]])
    .optional(),
  level: z.enum([...LEVEL_FILTER_VALUES] as [string, ...string[]]).optional(),
  isActive: z
    .enum([...IS_ACTIVE_FILTER_VALUES] as [string, ...string[]])
    .optional(),
});

export type CareerScenarioActionSchema = z.infer<
  typeof careerScenarioActionSchema
>;
export type CreateCareerScenarioSchema = z.infer<
  typeof createCareerScenarioSchema
>;
export type ScenariosFiltersFormValues = z.infer<
  typeof scenariosFiltersFormSchema
>;
