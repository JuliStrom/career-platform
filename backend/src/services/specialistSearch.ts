import type { PipelineStage } from 'mongoose';
import User from '../models/User';
import { EmploymentType, SpecialistWorkFormat, UserType } from '../types';

export interface SpecialistSearchFilters {
  direction?: string;
  level?: string;
  city?: string;
  format?: SpecialistWorkFormat;
}

export function buildSpecialistSearchPipeline(
  query: SpecialistSearchFilters,
  page: number,
  limit: number,
): PipelineStage[] {
  const filter: Record<string, unknown> = {};
  if (query.direction) {
    filter.directions = query.direction;
  }
  if (query.level) filter.level = query.level;
  if (query.city) filter.city = query.city;
  if (query.format === SpecialistWorkFormat.HIRE) {
    filter.employmentType = { $in: [EmploymentType.FULLTIME, EmploymentType.SEARCHING] };
  } else if (query.format === SpecialistWorkFormat.PROJECT) {
    filter.employmentType = { $in: [EmploymentType.FREELANCE, EmploymentType.BUSINESS] };
  }

  return [
    { $match: filter },
    // Sort before lookup so MongoDB can use a profile index. _id breaks ties.
    { $sort: { updatedAt: -1, _id: -1 } },
    // Exclude PDF buffers and other fields not needed by the cards.
    { $project: {
      userId: 1, name: 1, directions: 1, level: 1, skills: 1, careerGoal: 1,
      city: 1, employmentType: 1, experience: 1, currentCompany: 1,
      wantsRelocation: 1, relocationToCountry: 1,
    } },
    { $lookup: {
      from: User.collection.name,
      localField: 'userId',
      foreignField: '_id',
      pipeline: [
        { $match: {
          isDeleted: { $ne: true },
          isBlocked: { $ne: true },
          // Equality to null also includes legacy users with no userType field.
          userType: { $in: [UserType.SPECIALIST, null] },
        } },
        { $project: { _id: 1 } },
      ],
      as: 'eligibleUser',
    } },
    { $match: { 'eligibleUser.0': { $exists: true } } },
    // Count and pagination must both happen after account eligibility checks.
    { $facet: {
      items: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          directions: { $ifNull: ['$directions', []] },
          level: 1,
          skills: 1,
          careerGoal: 1,
          city: { $ifNull: ['$city', null] },
          employmentType: { $ifNull: ['$employmentType', null] },
          experience: { $ifNull: ['$experience', null] },
          currentCompany: { $ifNull: ['$currentCompany', null] },
          wantsRelocation: { $ifNull: ['$wantsRelocation', false] },
          relocationToCountry: { $ifNull: ['$relocationToCountry', null] },
        } },
      ],
      count: [{ $count: 'total' }],
    } },
    { $project: {
      items: 1,
      total: { $ifNull: [{ $arrayElemAt: ['$count.total', 0] }, 0] },
    } },
  ];
}
