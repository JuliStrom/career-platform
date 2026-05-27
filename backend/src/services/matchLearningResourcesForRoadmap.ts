import LearningResource from '../models/LearningResource';
import { LearningResourceRoadmapDto } from '../types/careerRoadmap';
import { normalizeSkillTag } from '../utils/skillTagNormalize';

function buildSkillIndex(skills: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of skills) {
    const key = normalizeSkillTag(s);
    if (key.length > 0) map.set(key, s);
  }
  return map;
}

export type LeanLearningResource = {
  _id: unknown;
  title: string;
  provider?: string | null;
  type?: string | null;
  direction?: string | null;
  level?: string | null;
  description?: string | null;
  url?: string | null;
  isInternational?: boolean;
  durationWeeks?: number | null;
  price?: number;
  locationType?: 'online' | 'offline' | 'hybrid';
  city?: string | null;
  country?: string | null;
  targetCountry?: string | null;
  tags: string[];
  skillsTags?: unknown;
  isFeatured?: boolean;
  isReskilling?: boolean;
};

function extractSkillTags(resource: LeanLearningResource): string[] {
  const tags = Array.isArray(resource.tags) ? resource.tags : [];
  const skillsTags = Array.isArray(resource.skillsTags)
    ? resource.skillsTags.filter((tag): tag is string => typeof tag === 'string')
    : [];

  return [...tags, ...skillsTags];
}

/** Матчинг в памяти: один список ресурсов на все карты одного ответа API */
export function mapLearningResourcesBySkillTags(
  skillsToDevelop: string[],
  resources: LeanLearningResource[]
): LearningResourceRoadmapDto[] {
  const skillIndex = buildSkillIndex(skillsToDevelop || []);
  if (skillIndex.size === 0) return [];

  const out: LearningResourceRoadmapDto[] = [];

  for (const r of resources) {
    const matchedKeys = new Set<string>();
    for (const t of extractSkillTags(r)) {
      const nt = normalizeSkillTag(t);
      if (skillIndex.has(nt)) matchedKeys.add(nt);
    }
    if (matchedKeys.size === 0) continue;

    const matchedSkills = [...matchedKeys].map((k) => skillIndex.get(k)!);

    out.push({
      id: String(r._id),
      title: r.title,
      provider: r.provider ?? null,
      type: r.type ?? null,
      direction: r.direction ?? null,
      level: r.level ?? null,
      description: r.description ?? null,
      url: r.url ?? null,
      isInternational: r.isInternational ?? false,
      durationWeeks: r.durationWeeks ?? null,
      price: r.price ?? 0,
      locationType: r.locationType ?? 'online',
      city: r.city ?? null,
      country: r.country ?? null,
      targetCountry: r.targetCountry ?? null,
      tags: r.tags,
      skillsTags: r.skillsTags ?? [],
      isFeatured: r.isFeatured ?? false,
      isReskilling: r.isReskilling ?? false,
      matchedSkills,
    });
  }

  return out;
}

export async function loadActiveLearningResourcesLean(): Promise<LeanLearningResource[]> {
  return LearningResource.find({
    isActive: true,
    $or: [
      { tags: { $exists: true, $ne: [] } },
      { skillsTags: { $exists: true, $ne: [] } },
    ],
  })
    .sort({ sortOrder: 1, title: 1 })
    .lean();
}
