import { z } from 'zod';
import { UserType } from '../types';
import { emailSchema, passwordSchema } from './common.schema';

const userTypeValues = Object.values(UserType) as [string, ...string[]];

// Схема регистрации: inviteCode опционален (обычная регистрация или по invite)
// userType опционален: путь выбирается на отдельном экране после регистрации
export const registerSchema = z.object({
  body: z.object({
    name: z.string().max(100).trim().optional(),
    email: emailSchema,
    password: passwordSchema,
    inviteCode: z.string().max(32).trim().optional(),
    userType: z
      .enum(userTypeValues, {
        message: `Неверный тип пользователя. Допустимые: ${userTypeValues.join(', ')}`,
      })
      .optional(),
  }),
});

// Схема входа
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

// Вход через Google: id_token от Google Sign-In
// inviteCode опционален — при регистрации по invite применяется роль из приглашения
export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'idToken обязателен'),
    inviteCode: z.string().max(32).trim().optional(),
  }),
});

// Вход/регистрация через Telegram: данные от Telegram Login Widget (id, auth_date, hash обязательны)
// inviteCode опционален — при регистрации по invite применяется роль из приглашения
export const telegramAuthSchema = z.object({
  body: z.object({
    id: z.number(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    photo_url: z.string().optional(),
    auth_date: z.number(),
    hash: z.string().min(1, 'hash обязателен'),
    inviteCode: z.string().max(32).trim().optional(),
  }),
});

// Выбор пути после регистрации: работодатель или специалист
export const setUserTypeSchema = z.object({
  body: z.object({
    userType: z.enum(userTypeValues, {
      message: `Неверный тип пользователя. Допустимые: ${userTypeValues.join(', ')}`,
    }),
  }),
});

// Экспорт типов из схем
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type TelegramAuthInput = z.infer<typeof telegramAuthSchema>;
export type SetUserTypeInput = z.infer<typeof setUserTypeSchema>;
