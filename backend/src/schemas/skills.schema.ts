import { z } from 'zod';

export const suggestSkillsSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, 'Укажите хотя бы одну букву')
      .max(50, 'Запрос не длиннее 50 символов'),
  }),
});
