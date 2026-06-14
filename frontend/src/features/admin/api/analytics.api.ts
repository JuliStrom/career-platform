import { apiClient } from '@/shared/config/api';

export interface AnalyticsSummary {
  usersTotal: number;
  invitesCreated: number;
  /** Количество активных инвайтов (если бэкенд не возвращает — показываем 0) */
  invitesActive?: number;
  invitesActivated: number;
  profilesCompleted: number;
  jobsViewed: number;
  careerTriggerUsers: number;
  careerTriggerRoadmapUsers: number;
  careerTriggerCoursesUsers: number;
  careerTriggerConsultationUsers: number;
}

export interface AnalyticsFunnel {
  invitesCreated: number;
  invitesOpened: number;
  registrationsCompleted: number;
  profilesCompleted: number;
}

export interface AnalyticsDetails {
  topDirections: { value: string; count: number }[];
  topLevels: { value: string; count: number }[];
  careerFunnel: {
    registered: number;
    profile: number;
    trigger: number;
    action: number;
  };
  tracks: {
    standard: number;
    reskilling: number;
    abroad: number;
  };
  aiRisk: {
    low: number;
    medium: number;
    high: number;
    unknown: number;
  };
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get<AnalyticsSummary>(
    '/admin/analytics/summary'
  );
  return data;
}

export async function fetchAnalyticsFunnel(): Promise<AnalyticsFunnel> {
  const { data } = await apiClient.get<AnalyticsFunnel>(
    '/admin/analytics/funnel'
  );
  return data;
}

export async function fetchAnalyticsDetails(): Promise<AnalyticsDetails> {
  const { data } = await apiClient.get<AnalyticsDetails>(
    '/admin/analytics/details'
  );
  return data;
}
