import { apiClient } from '@/shared/config/api';

export interface AnalyticsSummary {
  usersTotal: number;
  invitesCreated: number;
  /** Количество активных инвайтов (если бэкенд не возвращает — показываем 0) */
  invitesActive?: number;
  invitesActivated: number;
  profilesCompleted: number;
  jobsViewed: number;
}

export interface AnalyticsFunnel {
  invitesCreated: number;
  invitesOpened: number;
  registrationsCompleted: number;
  profilesCompleted: number;
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
