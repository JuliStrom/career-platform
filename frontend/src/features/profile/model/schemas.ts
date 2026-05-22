import {
  CareerChangeAgeRange,
  CareerChangeMotivation,
  CareerChangeTimeline,
  CareerGoal,
  City,
  Direction,
  EmploymentType,
  Level,
  ProfileLang,
} from '@/shared/model';
import { getValidationMessage } from '@/src/shared/lib/utils';
import { parseSkillsInput } from '@/features/profile/utils/skills.utils';
import { z } from 'zod';

const getProfileValidationMessage = (key: string) =>
  getValidationMessage(key, 'profile');

export const directionSchema = z.enum(Direction);

export const levelSchema = z.enum(Level);

export const careerGoalSchema = z.enum(CareerGoal);
export const citySchema = z.enum(City);
export const employmentTypeSchema = z.enum(EmploymentType);
export const profileLangSchema = z.enum(ProfileLang);
export const relocationOriginSchema = z.enum(['kazakhstan']);
export const relocationCountrySchema = z.enum([
  'usa',
  'canada',
  'germany',
  'russia',
  'china',
  'dubai',
  'europe',
  'other',
]);

export const baseProfileSchema = z.object({
  name: z
    .string()
    .min(2, getProfileValidationMessage('nameMin'))
    .max(100, getProfileValidationMessage('nameMax'))
    .trim(),
  // avatar: URL, путь /avatars/..., локальный URI (file, blob, content, …)
  avatar: z
    .union([
      z.literal(''),
      z.url(),
      z
        .string()
        .regex(/^\/avatars\/.+/, getProfileValidationMessage('avatarInvalid')),
      z.string().regex(/^blob:/, getProfileValidationMessage('avatarInvalid')),
      z
        .string()
        .regex(
          /^(file|content|ph|assets-library):\/\//,
          getProfileValidationMessage('avatarInvalid')
        ),
    ])
    .optional(),
  portfolioPdfContentType: z.union([z.string(), z.null()]).optional(),
  portfolioPdfName: z.union([z.string(), z.null()]).optional(),
  certificatePdfs: z
    .array(
      z.object({
        _id: z.string(),
        name: z.string(),
        contentType: z.string().optional(),
        uploadedAt: z.union([z.string(), z.date()]).optional(),
      })
    )
    .optional(),
  direction: directionSchema,
  level: levelSchema,
  experience: z
    .string()
    .min(10, getProfileValidationMessage('experienceMin'))
    .max(2000, getProfileValidationMessage('experienceMax'))
    .trim(),
  careerGoal: careerGoalSchema,
  careerStartDate: z.union([z.date(), z.string(), z.null()]).optional(),
  currentCompany: z.union([z.string(), z.null()]).optional(),
  city: z.union([citySchema, z.null()]).optional(),
  relocationFromCity: z.union([relocationOriginSchema, z.null()]).optional(),
  relocationToCountry: z.union([relocationCountrySchema, z.null()]).optional(),
  employmentType: z.union([employmentTypeSchema, z.null()]).optional(),
  lang: profileLangSchema.default(ProfileLang.RU),
  wantsRelocation: z.boolean().default(false),
  careerChangeTrackActive: z.boolean().default(false),
  careerChangeCurrentField: z.string().max(500).optional().default(''),
  careerChangeTargetDirection: directionSchema.optional(),
  careerChangeAgeRange: z
    .union([z.nativeEnum(CareerChangeAgeRange), z.literal('skip')])
    .default('skip'),
  careerChangeMotivation: z.nativeEnum(CareerChangeMotivation).optional(),
  careerChangeTimeline: z.nativeEnum(CareerChangeTimeline).optional(),
});

export const profileSchema = baseProfileSchema.extend({
  skills: z
    .array(
      z
        .string()
        .min(1, getProfileValidationMessage('skillEmpty'))
        .max(50, getProfileValidationMessage('skillMax'))
        .trim()
    )
    .min(1, getProfileValidationMessage('skillsMin'))
    .max(20, getProfileValidationMessage('skillsMax')),
});

// Валидация skillsInput: проверяем количество навыков (1–20), а не длину строки
export const profileFormSchema = baseProfileSchema
  .extend({
    skillsInput: z
      .string()
      .min(1, getProfileValidationMessage('skillsMin'))
      .refine(
        (val) => parseSkillsInput(val).length >= 1,
        getProfileValidationMessage('skillsMin')
      )
      .refine(
        (val) => parseSkillsInput(val).length <= 20,
        getProfileValidationMessage('skillsMax')
      ),
    careerStartDateInput: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim().length === 0) return true;
        return !Number.isNaN(new Date(val).getTime());
      }, getProfileValidationMessage('careerStartDateInvalid')),
  })
  .superRefine((data, ctx) => {
    if (!data.careerChangeTrackActive) return;
    const cur = data.careerChangeCurrentField?.trim() ?? '';
    if (cur.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getProfileValidationMessage('careerChangeCurrentFieldMin'),
        path: ['careerChangeCurrentField'],
      });
    }
    if (!data.careerChangeTargetDirection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getProfileValidationMessage('careerChangeTargetRequired'),
        path: ['careerChangeTargetDirection'],
      });
    }
    if (data.careerChangeMotivation == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getProfileValidationMessage('careerChangeMotivationRequired'),
        path: ['careerChangeMotivation'],
      });
    }
    if (data.careerChangeTimeline == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getProfileValidationMessage('careerChangeTimelineRequired'),
        path: ['careerChangeTimeline'],
      });
    }
  });

export type ProfileSchema = z.infer<typeof profileSchema>;
export type ProfileFormValues = z.input<typeof profileFormSchema>;
