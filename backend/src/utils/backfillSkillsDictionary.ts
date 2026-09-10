import { AnyBulkWriteOperation } from 'mongoose';
import { SKILL_CATALOG } from '../data/skillCatalog';
import Profile from '../models/Profile';
import SkillDictionary from '../models/SkillDictionary';
import {
  ensureSkillCategories,
  normalizeSkillName,
} from '../services/skillDictionary';
import { ISkillDictionary } from '../types/skill';

const BULK_CHUNK = 500;

async function bulkWriteChunks(
  ops: AnyBulkWriteOperation<ISkillDictionary>[]
): Promise<void> {
  for (let i = 0; i < ops.length; i += BULK_CHUNK) {
    await SkillDictionary.bulkWrite(ops.slice(i, i + BULK_CHUNK), {
      ordered: false,
    });
  }
}

export async function backfillSkillsDictionary(): Promise<void> {
  const categories = await ensureSkillCategories();
  const otherId = categories.get('other');
  if (!otherId) {
    throw new Error('Skill category "other" is missing');
  }

  try {
    await SkillDictionary.collection.dropIndex('nameNormalized_1_usageCount_-1');
  } catch {
    // Index may not exist on a fresh database.
  }

  const catalogItems = SKILL_CATALOG.map((item) => ({
    name: item.name,
    nameNormalized: normalizeSkillName(item.name),
    categoryId: categories.get(item.slug) ?? otherId,
  })).filter((item) => item.nameNormalized);

  const catalogKeys = catalogItems.map((item) => item.nameNormalized);
  const alreadyCatalog =
    catalogKeys.length === 0
      ? 0
      : await SkillDictionary.countDocuments({
          nameNormalized: { $in: catalogKeys },
        });

  let catalogInserted = 0;
  if (alreadyCatalog < catalogKeys.length) {
    const result = await SkillDictionary.bulkWrite(
      catalogItems.map((item) => ({
        updateOne: {
          filter: { nameNormalized: item.nameNormalized },
          update: {
            $setOnInsert: {
              name: item.name,
              nameNormalized: item.nameNormalized,
              categoryId: item.categoryId,
              usageCount: 0,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    catalogInserted = result.upsertedCount ?? 0;
  }

  const usageRows = await Profile.aggregate<{
    _id: string;
    count: number;
    name: string;
  }>([
    { $unwind: '$skills' },
    { $match: { skills: { $type: 'string' } } },
    {
      $project: {
        userId: '$_id',
        raw: { $trim: { input: '$skills' } },
      },
    },
    { $match: { raw: { $ne: '' } } },
    {
      $project: {
        userId: 1,
        raw: 1,
        key: { $substrCP: [{ $toLower: '$raw' }, 0, 50] },
      },
    },
    {
      $group: {
        _id: { userId: '$userId', key: '$key' },
        name: { $first: '$raw' },
      },
    },
    {
      $group: {
        _id: '$_id.key',
        count: { $sum: 1 },
        name: { $first: '$name' },
      },
    },
  ]);

  const counts = new Map<string, { name: string; count: number }>();
  for (const row of usageRows) {
    const nameNormalized = normalizeSkillName(row._id || row.name);
    if (!nameNormalized) continue;
    const current = counts.get(nameNormalized);
    if (current) {
      current.count += row.count;
    } else {
      counts.set(nameNormalized, {
        name: row.name.trim().replace(/\s+/g, ' ').slice(0, 50) || nameNormalized,
        count: row.count,
      });
    }
  }

  const usageOps: AnyBulkWriteOperation<ISkillDictionary>[] = [
    ...[...counts.entries()].map(([nameNormalized, { name, count }]) => ({
      updateOne: {
        filter: { nameNormalized },
        update: {
          $set: { usageCount: count },
          $setOnInsert: {
            name,
            nameNormalized,
            categoryId: otherId,
          },
        },
        upsert: true,
      },
    })),
  ];

  if (usageOps.length > 0) {
    await bulkWriteChunks(usageOps);
  }

  if (catalogInserted > 0 || usageOps.length > 0) {
    console.log(
      `Skills dictionary: catalog +${catalogInserted}, usage rows ${usageOps.length}`
    );
  }
}
