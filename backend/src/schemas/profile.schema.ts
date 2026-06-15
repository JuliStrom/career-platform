import { z } from 'zod';
import {
  Direction,
  Level,
  CareerGoal,
  City,
  EmploymentType,
  ProfileLang,
  CareerChangeAgeRange,
  CareerChangeMotivation,
  CareerChangeTimeline,
} from '../types';

// Массивы значений enum для валидации
const directionValues = Object.values(Direction) as [string, ...string[]];
const levelValues = Object.values(Level) as [string, ...string[]];
const careerGoalValues = Object.values(CareerGoal) as [string, ...string[]];
const cityValues = Object.values(City) as [string, ...string[]];
const employmentTypeValues = Object.values(EmploymentType) as [string, ...string[]];
const profileLangValues = Object.values(ProfileLang) as [string, ...string[]];
const careerChangeAgeValues = Object.values(CareerChangeAgeRange) as [string, ...string[]];
const careerChangeMotivationValues = Object.values(CareerChangeMotivation) as [string, ...string[]];
const careerChangeTimelineValues = Object.values(CareerChangeTimeline) as [string, ...string[]];
const relocationCountryValues = [
  'usa',
  'canada',
  'germany',
  'russia',
  'china',
  'europe',
  'other',
] as [string, ...string[]];
const relocationOriginValues = ['kazakhstan'] as [string, ...string[]];

const optionalDateNullable = z.union([z.coerce.date(), z.null()]).optional();

const careerChangeTrackFields = {
  careerChangeTrackActive: z.boolean().optional().default(false),
  careerChangeCurrentField: z
    .string()
    .max(500, 'Сфера не длиннее 500 символов')
    .trim()
    .optional()
    .nullable(),
  careerChangeTargetDirection: z.enum(directionValues).optional().nullable(),
  careerChangeAgeRange: z.enum(careerChangeAgeValues).optional().nullable(),
  careerChangeMotivation: z.enum(careerChangeMotivationValues).optional().nullable(),
  careerChangeTimeline: z.enum(careerChangeTimelineValues).optional().nullable(),
};

function refineCareerChangeTrack(data: {
  careerChangeTrackActive?: boolean;
  careerChangeCurrentField?: string | null;
  careerChangeTargetDirection?: string | null;
  careerChangeMotivation?: string | null;
  careerChangeTimeline?: string | null;
}) {
  if (data.careerChangeTrackActive !== true) return true;
  const cur = data.careerChangeCurrentField?.trim() ?? '';
  if (cur.length < 2) return false;
  if (!data.careerChangeTargetDirection) return false;
  if (!data.careerChangeMotivation) return false;
  if (!data.careerChangeTimeline) return false;
  return true;
}

// Схема создания профиля
export const createProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Имя обязательно')
      .trim(),
    avatar: z
      .union([
        z.string().url('Неверный формат URL'),
        z.string().regex(/^\/avatars\/.+/, 'Неверный формат пути аватара'),
      ])
      .optional()
      .nullable(),
    direction: z.enum(directionValues, {
      message: `Неверное направление. Допустимые значения: ${directionValues.join(', ')}`,
    }),
    level: z.enum(levelValues, {
      message: `Неверный уровень. Допустимые значения: ${levelValues.join(', ')}`,
    }),
    skills: z
      .array(z.string())
      .min(1, 'Должен быть хотя бы один навык')
      .refine(skills => skills.every(skill => skill.trim().length > 0), {
        message: 'Все навыки должны быть непустыми строками',
      }),
    experience: z
      .string()
      .min(1, 'Опыт обязателен'),
    careerGoal: z.enum(careerGoalValues, {
      message: `Неверная карьерная цель. Допустимые значения: ${careerGoalValues.join(', ')}`,
    }),
    careerStartDate: optionalDateNullable,
    currentCompany: z
      .string()
      .max(255, 'Компания не длиннее 255 символов')
      .trim()
      .optional()
      .nullable(),
    city: z.enum(cityValues, {
      message: `Неверный город. Допустимые значения: ${cityValues.join(', ')}`,
    }).optional().nullable(),
    relocationFromCity: z.enum(relocationOriginValues).optional().nullable(),
    relocationToCountry: z.enum(relocationCountryValues).optional().nullable(),
    employmentType: z.enum(employmentTypeValues, {
      message: `Неверный тип занятости. Допустимые значения: ${employmentTypeValues.join(', ')}`,
    }).optional().nullable(),
    lang: z.enum(profileLangValues, {
      message: `Неверный язык. Допустимые значения: ${profileLangValues.join(', ')}`,
    }).optional(),
    wantsRelocation: z.boolean().optional(),
    ...careerChangeTrackFields,
  })
    .superRefine((data, ctx) => {
      if (!refineCareerChangeTrack(data)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'При включённом треке «Меняю профессию» укажите текущую сферу (от 2 символов), целевое направление, мотивацию и горизонт перехода.',
          path: ['careerChangeTrackActive'],
        });
      }
    }),
});

// Схема обновления профиля (все поля опциональны)
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Имя не может быть пустым')
      .trim()
      .optional(),
    avatar: z
      .union([
        z.string().url('Неверный формат URL'),
        z.string().regex(/^\/avatars\/.+/, 'Неверный формат пути аватара'),
      ])
      .optional()
      .nullable(),
    direction: z.enum(directionValues, {
      message: `Неверное направление. Допустимые значения: ${directionValues.join(', ')}`,
    }).optional(),
    level: z.enum(levelValues, {
      message: `Неверный уровень. Допустимые значения: ${levelValues.join(', ')}`,
    }).optional(),
    skills: z
      .array(z.string())
      .min(1, 'Должен быть хотя бы один навык')
      .refine(skills => skills.every(skill => skill.trim().length > 0), {
        message: 'Все навыки должны быть непустыми строками',
      })
      .optional(),
    experience: z
      .string()
      .min(1, 'Опыт не может быть пустым')
      .optional(),
    careerGoal: z.enum(careerGoalValues, {
      message: `Неверная карьерная цель. Допустимые значения: ${careerGoalValues.join(', ')}`,
    }).optional(),
    careerStartDate: optionalDateNullable,
    currentCompany: z
      .string()
      .max(255, 'Компания не длиннее 255 символов')
      .trim()
      .optional()
      .nullable(),
    city: z.enum(cityValues, {
      message: `Неверный город. Допустимые значения: ${cityValues.join(', ')}`,
    }).optional().nullable(),
    relocationFromCity: z.enum(relocationOriginValues).optional().nullable(),
    relocationToCountry: z.enum(relocationCountryValues).optional().nullable(),
    employmentType: z.enum(employmentTypeValues, {
      message: `Неверный тип занятости. Допустимые значения: ${employmentTypeValues.join(', ')}`,
    }).optional().nullable(),
    lang: z.enum(profileLangValues, {
      message: `Неверный язык. Допустимые значения: ${profileLangValues.join(', ')}`,
    }).optional(),
    wantsRelocation: z.boolean().optional(),
    careerChangeTrackActive: z.boolean().optional(),
    careerChangeCurrentField: z
      .string()
      .max(500, 'Сфера не длиннее 500 символов')
      .trim()
      .optional()
      .nullable(),
    careerChangeTargetDirection: z.enum(directionValues).optional().nullable(),
    careerChangeAgeRange: z.enum(careerChangeAgeValues).optional().nullable(),
    careerChangeMotivation: z.enum(careerChangeMotivationValues).optional().nullable(),
    careerChangeTimeline: z.enum(careerChangeTimelineValues).optional().nullable(),
  })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Необходимо указать хотя бы одно поле для обновления',
    })
    .superRefine((data, ctx) => {
      if (data.careerChangeTrackActive !== true) return;
      if (!refineCareerChangeTrack({ ...data, careerChangeTrackActive: true })) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'При включении трека «Меняю профессию» передайте текущую сферу, целевое направление, мотивацию и горизонт.',
          path: ['careerChangeTrackActive'],
        });
      }
    }),
});

// Схема замены аватарки (только avatar, обязательный URL)
export const updateAvatarSchema = z.object({
  body: z.object({
    avatar: z
      .union([
        z.string().url('Неверный формат URL'),
        z.string().regex(/^\/avatars\/.+/, 'Неверный формат пути аватара'),
      ]),
  }),
});

// Экспорт типов из схем
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
