import Profile from '../models/Profile';
import { normalizeProfileDirections } from './profileDirections';

/**
 * Copy leftover scalar `direction` into `directions`, then drop `direction`.
 * Safe to run on every startup — no-ops when already migrated.
 */
export async function backfillProfileDirections(): Promise<void> {
  const toCopy = await Profile.collection
    .find({
      $and: [
        { direction: { $exists: true, $nin: [null, ''] } },
        {
          $or: [
            { directions: { $exists: false } },
            { directions: { $eq: [] } },
            { directions: null },
          ],
        },
      ],
    })
    .project({ direction: 1, directions: 1 })
    .toArray();

  for (const doc of toCopy) {
    const directions = normalizeProfileDirections({
      direction: doc.direction,
      directions: doc.directions,
    });
    if (directions.length === 0) continue;
    await Profile.collection.updateOne(
      { _id: doc._id },
      { $set: { directions } }
    );
  }

  const unsetResult = await Profile.collection.updateMany(
    { direction: { $exists: true } },
    { $unset: { direction: 1 } }
  );

  if (toCopy.length > 0 || unsetResult.modifiedCount > 0) {
    console.log(
      `Profile directions backfill: copied ${toCopy.length}, unset direction on ${unsetResult.modifiedCount}`
    );
  }
}
