import { apiClient } from '@/shared/config/api';

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SkillSuggestion {
  id: string;
  name: string;
  category: SkillCategory | null;
  usageCount: number;
}

export async function suggestSkills(
  query: string,
  signal?: AbortSignal
): Promise<SkillSuggestion[]> {
  const q = query.trim();
  if (!q) return [];
  const response = await apiClient.get<{ items: SkillSuggestion[] }>(
    '/skills/suggest',
    { params: { q }, signal }
  );
  return response.data.items ?? [];
}
