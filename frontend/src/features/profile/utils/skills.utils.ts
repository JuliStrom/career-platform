export const MAX_PROFILE_SKILLS = 20;
export const MAX_SKILL_NAME_LENGTH = 50;

export function normalizeSkillName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_SKILL_NAME_LENGTH);
}

export function skillKey(raw: string): string {
  return normalizeSkillName(raw).toLowerCase();
}

export function parseSkillsInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,،،\n]+/)
        .map((s) => normalizeSkillName(s))
        .filter(Boolean)
        .map((s) => skillKey(s))
    )
  );
}

export function addProfileSkill(
  current: string[],
  raw: string
): string[] {
  const name = normalizeSkillName(raw);
  if (!name) return current;
  if (current.some((item) => skillKey(item) === skillKey(name))) {
    return current;
  }
  if (current.length >= MAX_PROFILE_SKILLS) return current;
  return [...current, name];
}

export function removeProfileSkill(
  current: string[],
  raw: string
): string[] {
  const key = skillKey(raw);
  return current.filter((item) => skillKey(item) !== key);
}
