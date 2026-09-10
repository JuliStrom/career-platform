import i18n from '@/shared/config/i18n';

export const MAX_WORKPLACES = 10;
export const MAX_EXPERIENCE_PROJECTS = 5;

const PERIOD_START_RE = /^(\d{2})\.(\d{4})/;

export function currentPeriodPresentLabel(): string {
  return i18n.language?.toLowerCase().startsWith('ru') ? 'н.в.' : 'present';
}

export function formatCurrentPeriod(
  date: Date | string | null | undefined
): string {
  if (date == null || date === '') return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${month}.${parsed.getFullYear()} - ${currentPeriodPresentLabel()}`;
}

export function localizePeriodDisplay(raw: string): string {
  const start = parsePeriodStartDate(raw);
  if (!start || !/н\.в\.|present/i.test(raw)) return raw;
  return formatCurrentPeriod(start);
}

export function parsePeriodStartDate(raw: string): Date | null {
  const match = raw.trim().match(PERIOD_START_RE);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12 || year < 1900 || year > 2100) return null;
  return new Date(year, month - 1, 1);
}

export type ExperienceProjectFormValue = {
  name: string;
  role: string;
  result: string;
  link: string;
};

export type WorkplaceFormValue = {
  company: string;
  position: string;
  period: string;
  achievement: string;
  projects: ExperienceProjectFormValue[];
};

export function emptyWorkplace(achievement = ''): WorkplaceFormValue {
  return {
    company: '',
    position: '',
    period: '',
    achievement,
    projects: [],
  };
}

export function emptyExperienceProject(): ExperienceProjectFormValue {
  return { name: '', role: '', result: '', link: '' };
}

function mapProjects(
  raw?: ExperienceProjectFormValue[] | null
): ExperienceProjectFormValue[] {
  if (!raw?.length) return [];
  return raw.map((item) => ({
    name: item.name ?? '',
    role: item.role ?? '',
    result: item.result ?? '',
    link: item.link ?? '',
  }));
}

export function currentProjectsFromProfile(profile?: {
  workplaces?: Array<{ projects?: ExperienceProjectFormValue[] | null }> | null;
  projects?: ExperienceProjectFormValue[] | null;
}): ExperienceProjectFormValue[] {
  const hasNested = profile?.workplaces?.some((item) => (item.projects?.length ?? 0) > 0);
  if (hasNested) return mapProjects(profile?.projects);
  return [];
}

export function workplacesFromProfile(profile?: {
  workplaces?: Array<
    Omit<WorkplaceFormValue, 'projects'> & {
      projects?: ExperienceProjectFormValue[] | null;
    }
  > | null;
  projects?: ExperienceProjectFormValue[] | null;
  experience?: string | null;
}): WorkplaceFormValue[] {
  if (profile?.workplaces && profile.workplaces.length > 0) {
    const mapped = profile.workplaces.map((item) => ({
      company: item.company ?? '',
      position: item.position ?? '',
      period: item.period ?? '',
      achievement: item.achievement ?? '',
      projects: mapProjects(item.projects),
    }));
    const hasNested = mapped.some((item) => item.projects.length > 0);
    if (!hasNested && profile.projects?.length) {
      mapped[0] = {
        ...mapped[0],
        projects: mapProjects(profile.projects),
      };
    }
    return mapped;
  }
  const leftover = profile?.experience?.trim() ?? '';
  const first = emptyWorkplace(leftover);
  if (profile?.projects?.length) {
    first.projects = mapProjects(profile.projects);
  }
  return [first];
}

export function summarizeExperience(
  workplaces: WorkplaceFormValue[],
  currentProjects: ExperienceProjectFormValue[] = []
): string {
  const lines: string[] = [];
  for (const place of workplaces) {
    const title = [place.position.trim(), place.company.trim()]
      .filter(Boolean)
      .join(', ');
    const period = place.period.trim();
    const head = [title, period ? `(${period})` : ''].filter(Boolean).join(' ');
    const achievement = place.achievement.trim();
    lines.push([head, achievement].filter(Boolean).join(' — '));
    for (const project of place.projects ?? []) {
      const projectTitle = [project.name.trim(), project.role.trim()]
        .filter(Boolean)
        .join(' · ');
      lines.push([projectTitle, project.result.trim()].filter(Boolean).join(' — '));
    }
  }
  for (const project of currentProjects) {
    const projectTitle = [project.name.trim(), project.role.trim()]
      .filter(Boolean)
      .join(' · ');
    lines.push([projectTitle, project.result.trim()].filter(Boolean).join(' — '));
  }
  return lines.join('\n').slice(0, 2000);
}
