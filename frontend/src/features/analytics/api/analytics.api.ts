import { apiClient } from '@/shared/config/api';

export interface TrackEventPayload {
  eventName: string;
  entityType?: string | null;
  entityId?: string | null;
  properties?: Record<string, unknown>;
}

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  try {
    await apiClient.post('/analytics/events', payload);
  } catch (e) {
    if (__DEV__) console.warn('Analytics trackEvent failed:', e);
  }
}
