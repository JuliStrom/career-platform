export const MAX_WORKPLACES = 10;
export const MAX_EXPERIENCE_PROJECTS = 5;
export const MAX_EXPERIENCE_SUMMARY = 2000;

export type ExperienceProjectInput = {
  name: string;
  role: string;
  result: string;
  link?: string;
};

export type WorkplaceInput = {
  company: string;
  position: string;
  period: string;
  achievement: string;
  projects: ExperienceProjectInput[];
};

function trimField(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

export function normalizeExperienceProjects(raw: unknown): ExperienceProjectInput[] {
  if (!Array.isArray(raw)) return [];
  const items: ExperienceProjectInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = trimField(row.name, 120);
    const role = trimField(row.role, 120);
    const result = trimField(row.result, 500);
    const link = trimField(row.link, 500);
    if (!name && !role && !result && !link) continue;
    items.push({ name, role, result, link });
    if (items.length >= MAX_EXPERIENCE_PROJECTS) break;
  }
  return items;
}

export function normalizeWorkplaces(raw: unknown): WorkplaceInput[] {
  if (!Array.isArray(raw)) return [];
  const items: WorkplaceInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const company = trimField(row.company, 120);
    const position = trimField(row.position, 120);
    const period = trimField(row.period, 80);
    const achievement = trimField(row.achievement, 500);
    const projects = normalizeExperienceProjects(row.projects);
    if (!company && !position && !period && !achievement && projects.length === 0) {
      continue;
    }
    items.push({ company, position, period, achievement, projects });
    if (items.length >= MAX_WORKPLACES) break;
  }
  return items;
}

export function summarizeExperience(
  workplaces: WorkplaceInput[],
  currentProjects: ExperienceProjectInput[] = []
): string {
  const lines: string[] = [];
  for (const place of workplaces) {
    const title = [place.position, place.company].filter(Boolean).join(', ');
    const head = [title, place.period ? `(${place.period})` : '']
      .filter(Boolean)
      .join(' ');
    lines.push([head, place.achievement].filter(Boolean).join(' — '));
    for (const project of place.projects) {
      const projectTitle = [project.name, project.role].filter(Boolean).join(' · ');
      lines.push([projectTitle, project.result].filter(Boolean).join(' — '));
    }
  }
  for (const project of currentProjects) {
    const projectTitle = [project.name, project.role].filter(Boolean).join(' · ');
    lines.push([projectTitle, project.result].filter(Boolean).join(' — '));
  }
  return lines.join('\n').slice(0, MAX_EXPERIENCE_SUMMARY);
}

export function resolveExperienceFields(input: {
  workplaces?: unknown;
  projects?: unknown;
  experience?: unknown;
}): {
  workplaces: WorkplaceInput[];
  projects: ExperienceProjectInput[];
  experience: string;
} {
  const workplaces = normalizeWorkplaces(input.workplaces);
  let currentProjects = normalizeExperienceProjects(input.projects);
  const hasNested = workplaces.some((place) => place.projects.length > 0);
  if (!hasNested && currentProjects.length > 0 && workplaces.length > 0) {
    workplaces[0] = {
      ...workplaces[0],
      projects: currentProjects,
    };
    currentProjects = [];
  }
  const summary = summarizeExperience(workplaces, currentProjects);
  const fallback =
    typeof input.experience === 'string' ? input.experience.trim() : '';
  return {
    workplaces,
    projects: currentProjects,
    experience: summary || fallback,
  };
}
