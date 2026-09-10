export enum NotificationType {
  GROWTH_TRIGGER = 'growth_trigger',
  NEW_JOBS = 'new_jobs',
  NEW_COURSES = 'new_courses',
  CONSULTATION_REMINDER = 'consultation_reminder',
  AI_RISK_UPDATED = 'ai_risk_updated',
  EMPLOYER_MESSAGE = 'employer_message',
  EMPLOYER_PROJECT_OFFER = 'employer_project_offer',
}

export interface NotificationPayload {
  route?: string;
  years?: number;
  level?: string;
  direction?: string;
  count?: number;
  jobIds?: string[];
  courseIds?: string[];
  consultationId?: string;
  startsAt?: string;
  [key: string]: unknown;
}

export interface Notification {
  _id: string;
  type: NotificationType;
  payload: NotificationPayload;
  isRead: boolean;
  sentAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
