import { getValidationMessage } from '@/src/shared/lib/utils';
import { z } from 'zod';

/** Сообщения подтягиваются из i18n при создании схемы (см. useAuthForm / RegisterWithInviteForm). */
function authMsg(key: string) {
  return getValidationMessage(key, 'auth');
}

export function createEmailSchema() {
  return z
    .email({ error: authMsg('emailInvalid') })
    .min(1, { error: authMsg('emailRequired') })
    .min(5, { error: authMsg('emailMin') })
    .max(255, { error: authMsg('emailMax') })
    .toLowerCase()
    .trim();
}

export function createPasswordSchema() {
  return z
    .string()
    .min(1, { message: authMsg('passwordRequired') })
    .min(8, { message: authMsg('passwordMin') })
    .max(128, { message: authMsg('passwordMax') })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, authMsg('passwordWeak'));
}

export function createLoginSchema() {
  return z.object({
    email: createEmailSchema(),
    password: z.string().min(1, { message: authMsg('passwordRequired') }),
  });
}

/** Обычная регистрация (без invite) */
export function createRegisterBasicSchema() {
  return z
    .object({
      email: createEmailSchema(),
      password: createPasswordSchema(),
      confirmPassword: z
        .string()
        .min(1, { message: authMsg('confirmPasswordRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: authMsg('passwordsMismatch'),
      path: ['confirmPassword'],
    });
}

/** Регистрация по invite (с именем) */
export function createRegisterSchema() {
  return z
    .object({
      name: z
        .string()
        .min(1, { message: authMsg('nameRequired') })
        .min(2, { message: authMsg('nameMin') })
        .max(100, { message: authMsg('nameMax') })
        .trim(),
      email: createEmailSchema(),
      password: createPasswordSchema(),
      confirmPassword: z
        .string()
        .min(1, { message: authMsg('confirmPasswordRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: authMsg('passwordsMismatch'),
      path: ['confirmPassword'],
    });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
export type RegisterBasicFormData = z.infer<
  ReturnType<typeof createRegisterBasicSchema>
>;
