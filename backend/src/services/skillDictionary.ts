import { Types } from 'mongoose';
import SkillCategory from '../models/SkillCategory';
import SkillDictionary from '../models/SkillDictionary';
import { SKILL_CATEGORY_SEEDS } from '../types/skill';
import { normalizeSkillTag } from '../utils/skillTagNormalize';

export const MAX_SKILL_NAME_LENGTH = 50;
export const MAX_PROFILE_SKILLS = 20;
export const SKILL_SUGGEST_LIMIT = 10;

export function normalizeSkillName(raw: string): string {
  return normalizeSkillTag(raw).slice(0, MAX_SKILL_NAME_LENGTH);
}

export function collectProfileSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const item of skills) {
    if (typeof item !== 'string') continue;
    const normalized = normalizeSkillName(item);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
    if (unique.length >= MAX_PROFILE_SKILLS) break;
  }
  return unique;
}

function displayNamesFromPayload(skills: unknown): Map<string, string> {
  const names = new Map<string, string>();
  if (!Array.isArray(skills)) return names;
  for (const item of skills) {
    if (typeof item !== 'string') continue;
    const normalized = normalizeSkillName(item);
    if (!normalized || names.has(normalized)) continue;
    const trimmed = item.trim().replace(/\s+/g, ' ').slice(0, MAX_SKILL_NAME_LENGTH);
    names.set(normalized, trimmed || normalized);
  }
  return names;
}

let categoryCache: Map<string, Types.ObjectId> | null = null;
let categoryCachePromise: Promise<Map<string, Types.ObjectId>> | null = null;

export async function ensureSkillCategories(): Promise<Map<string, Types.ObjectId>> {
  if (categoryCache) return categoryCache;
  if (categoryCachePromise) return categoryCachePromise;

  categoryCachePromise = (async () => {
    const docs = await Promise.all(
      SKILL_CATEGORY_SEEDS.map((seed) =>
        SkillCategory.findOneAndUpdate(
          { slug: seed.slug },
          { $setOnInsert: { slug: seed.slug, name: seed.name } },
          { upsert: true, new: true }
        )
      )
    );
    const bySlug = new Map<string, Types.ObjectId>();
    SKILL_CATEGORY_SEEDS.forEach((seed, index) => {
      bySlug.set(seed.slug, docs[index]._id);
    });
    return bySlug;
  })();

  try {
    categoryCache = await categoryCachePromise;
    return categoryCache;
  } finally {
    categoryCachePromise = null;
  }
}

async function getOtherCategoryId(): Promise<Types.ObjectId> {
  const categories = await ensureSkillCategories();
  const otherId = categories.get('other');
  if (!otherId) {
    throw new Error('Skill category "other" is missing');
  }
  return otherId;
}

export async function resolveProfileSkills(
  incoming: unknown,
  previous: string[] = []
): Promise<string[]> {
  const incomingNormalized = collectProfileSkills(incoming);
  const previousNormalized = previous
    .map((item) => normalizeSkillName(item))
    .filter(Boolean);
  const previousSet = new Set(previousNormalized);
  const incomingSet = new Set(incomingNormalized);
  const displayNames = displayNamesFromPayload(incoming);

  const lookupKeys = [...new Set([...incomingNormalized, ...previousNormalized])];
  const existing =
    lookupKeys.length === 0
      ? []
      : await SkillDictionary.find(
          { nameNormalized: { $in: lookupKeys } },
          { name: 1, nameNormalized: 1 }
        ).lean<{ name: string; nameNormalized: string }[]>();
  const existingByKey = new Map<string, string>(
    existing.map((doc) => [doc.nameNormalized, doc.name])
  );

  const ops: Parameters<typeof SkillDictionary.bulkWrite>[0] = [];
  const resolved: string[] = [];
  const missing = incomingNormalized.filter((key) => !existingByKey.has(key));

  if (missing.length > 0) {
    const otherCategoryId = await getOtherCategoryId();
    for (const normalized of missing) {
      const name = displayNames.get(normalized) ?? normalized;
      existingByKey.set(normalized, name);
      ops.push({
        updateOne: {
          filter: { nameNormalized: normalized },
          update: {
            $setOnInsert: {
              name,
              nameNormalized: normalized,
              categoryId: otherCategoryId,
            },
            $inc: { usageCount: previousSet.has(normalized) ? 0 : 1 },
          },
          upsert: true,
        },
      });
    }
  }

  const created = new Set(missing);
  for (const normalized of incomingNormalized) {
    resolved.push(existingByKey.get(normalized) ?? normalized);
    if (previousSet.has(normalized) || created.has(normalized)) continue;
    ops.push({
      updateOne: {
        filter: { nameNormalized: normalized },
        update: { $inc: { usageCount: 1 } },
      },
    });
  }

  for (const prev of previousSet) {
    if (incomingSet.has(prev)) continue;
    ops.push({
      updateOne: {
        filter: { nameNormalized: prev, usageCount: { $gt: 0 } },
        update: { $inc: { usageCount: -1 } },
      },
    });
  }

  if (ops.length > 0) {
    await SkillDictionary.bulkWrite(ops, { ordered: false });
  }

  return resolved;
}

type SuggestedSkillDoc = {
  _id: Types.ObjectId;
  name: string;
  usageCount: number;
  categoryId?: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  } | null;
};

export async function suggestSkills(query: string) {
  const q = normalizeSkillName(query);
  if (!q) return [];

  const docs = await SkillDictionary.find({
    nameNormalized: { $gte: q, $lt: `${q}\uffff` },
  })
    .sort({ usageCount: -1, name: 1 })
    .limit(SKILL_SUGGEST_LIMIT)
    .populate('categoryId', 'name slug')
    .lean<SuggestedSkillDoc[]>();

  return docs.map((doc: SuggestedSkillDoc) => {
    const category = doc.categoryId
      ? {
          id: String(doc.categoryId._id),
          name: doc.categoryId.name,
          slug: doc.categoryId.slug,
        }
      : null;
    return {
      id: String(doc._id),
      name: doc.name,
      category,
      usageCount: doc.usageCount,
    };
  });
}
