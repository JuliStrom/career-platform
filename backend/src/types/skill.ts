import { Document, Types } from 'mongoose';

export interface ISkillCategory extends Document {
  name: string;
  slug: string;
}

export interface ISkillDictionary extends Document {
  name: string;
  nameNormalized: string;
  categoryId: Types.ObjectId;
  usageCount: number;
}

export const SKILL_CATEGORY_SLUGS = [
  'language',
  'framework',
  'tool',
  'soft-skill',
  'domain',
  'other',
] as const;

export type SkillCategorySlug = (typeof SKILL_CATEGORY_SLUGS)[number];

export const SKILL_CATEGORY_SEEDS: {
  slug: SkillCategorySlug;
  name: string;
}[] = [
  { slug: 'language', name: 'Language' },
  { slug: 'framework', name: 'Framework' },
  { slug: 'tool', name: 'Tool' },
  { slug: 'soft-skill', name: 'Soft skill' },
  { slug: 'domain', name: 'Domain' },
  { slug: 'other', name: 'Other' },
];
