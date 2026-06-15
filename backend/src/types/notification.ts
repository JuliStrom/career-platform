import { Document, Types } from 'mongoose';

export enum NotificationType {
  GROWTH_TRIGGER = 'growth_trigger',
  NEW_JOBS = 'new_jobs',
  NEW_COURSES = 'new_courses',
  CONSULTATION_REMINDER = 'consultation_reminder',
  AI_RISK_UPDATED = 'ai_risk_updated',
}

export interface NotificationPayload {
  years?: number;
  level?: string;
  direction?: string;
  count?: number;
  jobIds?: string[];
  courseIds?: string[];
  consultationId?: string;
  startsAt?: Date;
  route?: string;
  [key: string]: unknown;
}

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  payload: NotificationPayload;
  isRead: boolean;
  sentAt: Date;
  deduplicationKey: string;
}
