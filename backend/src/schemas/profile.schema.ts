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

const optionalUrl = z
  .string()
  .trim()
  .max(500, 'Ссылка не длиннее 500 символов')
  .refine(
    (value) => value.length === 0 || /^https?:\/\//i.test(value),
    'Ссылка должна начинаться с http:// или https://'
  );

const experienceProjectSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название проекта').max(120, 'Название не длиннее 120 символов'),
  role: z.string().trim().min(1, 'Укажите роль в проекте').max(120, 'Роль не длиннее 120 символов'),
  result: z.string().trim().min(1, 'Укажите результат').max(500, 'Результат не длиннее 500 символов'),
  link: optionalUrl.optional().or(z.literal('')),
});

const workplaceSchema = z.object({
  company: z.string().trim().min(1, 'Укажите компанию').max(120, 'Компания не длиннее 120 символов'),
  position: z.string().trim().min(1, 'Укажите должность').max(120, 'Должность не длиннее 120 символов'),
  period: z.string().trim().min(1, 'Укажите период').max(80, 'Период не длиннее 80 символов'),
  achievement: z
    .string()
    .trim()
    .min(1, 'Укажите достижение')
    .max(500, 'Достижение не длиннее 500 символов'),
  projects: z.array(experienceProjectSchema).max(5, 'Можно указать не больше 5 проектов').optional(),
});

const workplacesField = z.array(workplaceSchema).max(10, 'Можно указать не больше 10 мест работы');
const projectsField = z.array(experienceProjectSchema).max(5, 'Можно указать не больше 5 проектов');

const directionsField = z
  .array(
    z.enum(directionValues, {
      message: `Неверное направление. Допустимые значения: ${directionValues.join(', ')}`,
    })
  )
  .min(1, 'Выберите хотя бы одно направление')
  .max(3, 'Можно выбрать не больше 3 направлений')
  .refine((values) => new Set(values).size === values.length, {
    message: 'Направления должны быть уникальными',
  });

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
    aboutMe: z
      .string()
      .trim()
      .max(400, 'Текст «Обо мне» не длиннее 400 символов')
      .optional()
      .nullable(),
    avatar: z
      .union([
        z.string().url('Неверный формат URL'),
        z.string().regex(/^\/avatars\/.+/, 'Неверный формат пути аватара'),
      ])
      .optional()
      .nullable(),
    directions: directionsField,
    level: z.enum(levelValues, {
      message: `Неверный уровень. Допустимые значения: ${levelValues.join(', ')}`,
    }),
    skills: z
      .array(z.string())
      .min(1, 'Должен быть хотя бы один навык')
      .refine(skills => skills.every(skill => skill.trim().length > 0), {
        message: 'Все навыки должны быть непустыми строками',
      }),
    experience: z.string().max(2000, 'Опыт не длиннее 2000 символов').optional(),
    workplaces: workplacesField.optional(),
    projects: projectsField.optional(),
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
    currentPosition: z
      .string()
      .max(120, 'Должность не длиннее 120 символов')
      .trim()
      .optional()
      .nullable(),
    currentAchievement: z
      .string()
      .max(500, 'Достижение не длиннее 500 символов')
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
      const hasWorkplaces = (data.workplaces?.length ?? 0) > 0;
      const hasExperienceText = Boolean(data.experience?.trim());
      if (!hasWorkplaces && !hasExperienceText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Укажите хотя бы одно место работы',
          path: ['workplaces'],
        });
      }
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
    aboutMe: z
      .string()
      .trim()
      .max(400, 'Текст «Обо мне» не длиннее 400 символов')
      .optional()
      .nullable(),
    avatar: z
      .union([
        z.string().url('Неверный формат URL'),
        z.string().regex(/^\/avatars\/.+/, 'Неверный формат пути аватара'),
      ])
      .optional()
      .nullable(),
    directions: directionsField.optional(),
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
    experience: z.string().max(2000, 'Опыт не длиннее 2000 символов').optional(),
    workplaces: workplacesField.optional(),
    projects: projectsField.optional(),
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
    currentPosition: z
      .string()
      .max(120, 'Должность не длиннее 120 символов')
      .trim()
      .optional()
      .nullable(),
    currentAchievement: z
      .string()
      .max(500, 'Достижение не длиннее 500 символов')
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
