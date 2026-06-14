import { Response } from 'express';
import AnalyticsEvent from '../models/AnalyticsEvent';
import User from '../models/User';
import Invite from '../models/Invite';
import InviteUsage from '../models/InviteUsage';
import Profile from '../models/Profile';
import { AuthRequest } from '../types';
import { getErrorMessage } from '../utils/errorHandlers';

/** GET /api/admin/analytics/summary */
export const getSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      usersTotal,
      invitesCreated,
      invitesActive,
      invitesActivated,
      profilesCompleted,
      jobsViewed,
      careerTriggerUsers,
      careerTriggerRoadmapUsers,
      careerTriggerCoursesUsers,
      careerTriggerConsultationUsers,
    ] =
      await Promise.all([
        User.countDocuments({ isDeleted: false }),
        Invite.countDocuments(),
        Invite.countDocuments({ isActive: true }),
        InviteUsage.countDocuments(),
        Profile.countDocuments(),
        AnalyticsEvent.countDocuments({ eventName: 'job_viewed' }),
        AnalyticsEvent.distinct('userId', {
          eventName: 'career_trigger_viewed',
          userId: { $ne: null },
        }),
        AnalyticsEvent.distinct('userId', {
          eventName: 'career_trigger_cta_clicked',
          userId: { $ne: null },
          'properties.ctaType': 'roadmap',
        }),
        AnalyticsEvent.distinct('userId', {
          eventName: 'career_trigger_cta_clicked',
          userId: { $ne: null },
          'properties.ctaType': 'courses',
        }),
        AnalyticsEvent.distinct('userId', {
          eventName: 'career_trigger_cta_clicked',
          userId: { $ne: null },
          'properties.ctaType': 'consultation',
        }),
      ]);

    res.status(200).json({
      usersTotal,
      invitesCreated,
      invitesActive,
      invitesActivated,
      profilesCompleted,
      jobsViewed,
      careerTriggerUsers: careerTriggerUsers.length,
      careerTriggerRoadmapUsers: careerTriggerRoadmapUsers.length,
      careerTriggerCoursesUsers: careerTriggerCoursesUsers.length,
      careerTriggerConsultationUsers: careerTriggerConsultationUsers.length,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

/** GET /api/admin/analytics/funnel */
export const getFunnel = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [invitesCreated, invitesOpened, registrationsCompleted, profilesCompleted] =
      await Promise.all([
        Invite.countDocuments(),
        AnalyticsEvent.countDocuments({ eventName: 'invite_opened' }),
        InviteUsage.countDocuments(),
        Profile.countDocuments(),
      ]);

    res.status(200).json({
      invitesCreated,
      invitesOpened,
      registrationsCompleted,
      profilesCompleted,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

/** GET /api/admin/analytics/details */
export const getDetails = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      topDirections,
      topLevels,
      registeredUsers,
      profileUsers,
      triggerUsers,
      actionUsers,
      trackDistribution,
      aiRiskDistribution,
    ] = await Promise.all([
      Profile.aggregate([
        { $group: { _id: '$direction', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Profile.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      User.countDocuments({ isDeleted: false }),
      Profile.countDocuments(),
      AnalyticsEvent.distinct('userId', {
        eventName: 'career_trigger_viewed',
        userId: { $ne: null },
      }),
      AnalyticsEvent.distinct('userId', {
        eventName: 'career_trigger_cta_clicked',
        userId: { $ne: null },
      }),
      Profile.aggregate([
        {
          $project: {
            track: {
              $switch: {
                branches: [
                  {
                    case: {
                      $or: [
                        { $eq: ['$careerChangeTrackActive', true] },
                        { $eq: ['$employmentType', 'reskilling'] },
                        { $eq: ['$careerGoal', 'Career Change'] },
                      ],
                    },
                    then: 'reskilling',
                  },
                  {
                    case: {
                      $or: [
                        { $eq: ['$wantsRelocation', true] },
                        { $eq: ['$city', 'abroad'] },
                      ],
                    },
                    then: 'abroad',
                  },
                ],
                default: 'standard',
              },
            },
          },
        },
        { $group: { _id: '$track', count: { $sum: 1 } } },
      ]),
      Profile.aggregate([
        {
          $lookup: {
            from: 'ai_risk_index',
            let: { direction: '$direction', level: '$level' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$direction', '$$direction'] },
                      { $eq: ['$level', '$$level'] },
                    ],
                  },
                },
              },
              { $project: { riskLevel: 1 } },
            ],
            as: 'risk',
          },
        },
        {
          $project: {
            riskLevel: {
              $ifNull: [{ $arrayElemAt: ['$risk.riskLevel', 0] }, 'unknown'],
            },
          },
        },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),
    ]);

    const toRecord = (rows: Array<{ _id: string; count: number }>) =>
      Object.fromEntries(rows.map((row) => [row._id, row.count]));

    res.status(200).json({
      topDirections: topDirections.map((row) => ({
        value: row._id,
        count: row.count,
      })),
      topLevels: topLevels.map((row) => ({
        value: row._id,
        count: row.count,
      })),
      careerFunnel: {
        registered: registeredUsers,
        profile: profileUsers,
        trigger: triggerUsers.length,
        action: actionUsers.length,
      },
      tracks: {
        standard: toRecord(trackDistribution).standard ?? 0,
        reskilling: toRecord(trackDistribution).reskilling ?? 0,
        abroad: toRecord(trackDistribution).abroad ?? 0,
      },
      aiRisk: {
        low: toRecord(aiRiskDistribution).low ?? 0,
        medium: toRecord(aiRiskDistribution).medium ?? 0,
        high: toRecord(aiRiskDistribution).high ?? 0,
        unknown: toRecord(aiRiskDistribution).unknown ?? 0,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
