export function parseSkillsInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,،،\n]+/)
        .map((s) => s.trim())
        .map((s) => s.replace(/\s+/g, ' '))
        .filter(Boolean)
        .map((s) => s.slice(0, 50))
        .map((s) => s.toLowerCase())
    )
  );
}

export function formatSkillsInput(skills: string[]): string {
  return skills.join(', ');
}
