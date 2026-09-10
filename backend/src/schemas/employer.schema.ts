import { z } from "zod";
import {
  Direction,
  EmployerBudgetRange,
  EmployerContactKind,
  EmployerTaskType,
  Level,
  City,
  SpecialistWorkFormat,
} from "../types";
import { objectIdSchema } from "./common.schema";
import { companyCardSchema } from "./adminCompanies.schema";
import { jobEditableFieldsSchema } from "./job.schema";

const directionValues = Object.values(Direction) as [string, ...string[]];
const taskTypeValues = Object.values(EmployerTaskType) as [string, ...string[]];
const budgetValues = Object.values(EmployerBudgetRange) as [
  string,
  ...string[],
];
const levelValues = Object.values(Level) as [string, ...string[]];
const cityValues = Object.values(City) as [string, ...string[]];
const formatValues = Object.values(SpecialistWorkFormat) as [
  string,
  ...string[],
];
const contactKindValues = Object.values(EmployerContactKind) as [
  string,
  ...string[],
];

const employerProfileBody = z.object({
  name: z.string().trim().min(2, "Укажите название").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Описание должно содержать минимум 10 символов")
    .max(2000),
  industry: z.enum(directionValues, { message: "Неверная сфера" }),
  taskType: z.enum(taskTypeValues, { message: "Неверный тип задач" }),
  budgetRange: z.enum(budgetValues).nullable().optional(),
});

export const createEmployerProfileSchema = z.object({
  body: employerProfileBody.strict(),
});

export const updateEmployerProfileSchema = z.object({
  body: employerProfileBody
    .partial()
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "Нет полей для обновления",
    }),
});

export const createEmployerCompanySchema = z.object({
  body: companyCardSchema.strict(),
});

export const updateEmployerCompanySchema = z.object({
  body: companyCardSchema
    .partial()
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "Нет полей для обновления",
    }),
});

export const employerJobIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createEmployerJobSchema = z.object({
  body: jobEditableFieldsSchema.strict(),
});

export const updateEmployerJobSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: jobEditableFieldsSchema
    .partial()
    .extend({ isActive: z.boolean().optional() })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "Нет полей для обновления",
    }),
});

export const listSpecialistsSchema = z.object({
  query: z.object({
    direction: z.enum(directionValues).optional(),
    level: z.enum(levelValues).optional(),
    city: z.enum(cityValues).optional(),
    format: z.enum(formatValues).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const contactSpecialistSchema = z.object({
  params: z.object({
    profileId: objectIdSchema,
  }),
  body: z.object({
    kind: z.enum(contactKindValues, { message: "Неверный тип обращения" }),
    message: z.string().trim().max(1000).optional(),
  }),
});
