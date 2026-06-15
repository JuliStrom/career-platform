export function formatEducationSkillsTags(
  skillsTags: unknown,
  emptyValue: string
) {
  if (!skillsTags) return emptyValue;
  if (Array.isArray(skillsTags)) return skillsTags.join(', ');
  if (typeof skillsTags === 'string') return skillsTags;
  return JSON.stringify(skillsTags);
}

export function formatKztPrice(price: number) {
  return `${price.toLocaleString('ru-RU')} KZT`;
}
