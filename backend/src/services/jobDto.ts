import Job from '../models/Job';
import Profile from '../models/Profile';
import { NotificationType } from '../types';
import { createNotification } from './notificationDto';

type JobResponseObject = Record<string, unknown> & {
  companyId?: unknown;
  companyCulture?: unknown;
};

const isPopulatedCompany = (
  value: unknown
): value is Record<string, unknown> & { _id: unknown; name: unknown } =>
  Boolean(value && typeof value === 'object' && 'name' in value);

export const serializeJob = (
  job: { toObject: () => JobResponseObject }
): JobResponseObject => {
  const data = job.toObject();
  if (isPopulatedCompany(data.companyId)) {
    const { ownerId: _ownerId, ...companyCulture } = data.companyId;
    data.companyCulture = companyCulture;
    data.companyId = companyCulture._id;
  }
  return data;
};

export const notifyAboutNewJob = async (
  job: InstanceType<typeof Job>
): Promise<void> => {
  const profiles = await Profile.find({
    directions: job.direction,
    level: job.level,
  }).select('userId');

  await Promise.all(
    profiles.map((profile) =>
      createNotification({
        userId: profile.userId,
        type: NotificationType.NEW_JOBS,
        payload: {
          count: 1,
          jobIds: [job._id.toString()],
          route: `/jobs/${job._id}`,
        },
        deduplicationKey: `new-job: ${job._id}:${profile.userId}`,
      })
    )
  );
};
