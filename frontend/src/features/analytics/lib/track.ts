import { trackEvent } from '../api/analytics.api';

export const analytics = {
  inviteOpened: (inviteCode: string) =>
    trackEvent({
      eventName: 'invite_opened',
      entityType: 'invite',
      entityId: inviteCode,
    }),

  inviteInvalid: (inviteCode: string) =>
    trackEvent({
      eventName: 'invite_invalid',
      entityType: 'invite',
      entityId: inviteCode,
    }),

  registerStarted: (inviteCode: string) =>
    trackEvent({
      eventName: 'register_started',
      entityType: 'invite',
      entityId: inviteCode,
    }),

  registerCompleted: () => trackEvent({ eventName: 'register_completed' }),

  loginSuccess: () => trackEvent({ eventName: 'login_success' }),

  profileCreated: () => trackEvent({ eventName: 'profile_created' }),

  profileUpdated: () => trackEvent({ eventName: 'profile_updated' }),

  profileCompleted: () => trackEvent({ eventName: 'profile_completed' }),

  jobsListOpened: () => trackEvent({ eventName: 'jobs_list_opened' }),

  jobViewed: (jobId: string) =>
    trackEvent({
      eventName: 'job_viewed',
      entityType: 'job',
      entityId: jobId,
    }),

  jobFavorited: (jobId: string) =>
    trackEvent({
      eventName: 'job_favorited',
      entityType: 'job',
      entityId: jobId,
    }),

  jobsFiltered: (filters: Record<string, unknown>) =>
    trackEvent({
      eventName: 'jobs_filtered',
      properties: filters,
    }),

  careerRecommendationsOpened: () =>
    trackEvent({ eventName: 'career_recommendations_opened' }),

  careerScenarioViewed: (scenarioId: string) =>
    trackEvent({
      eventName: 'career_scenario_viewed',
      entityType: 'career_scenario',
      entityId: scenarioId,
    }),

  recommendationClicked: (recommendationId: string) =>
    trackEvent({
      eventName: 'recommendation_clicked',
      entityType: 'recommendation',
      entityId: recommendationId,
    }),

  careerTriggerViewed: (triggerId: string) =>
    trackEvent({
      eventName: 'career_trigger_viewed',
      entityType: 'career_trigger',
      entityId: triggerId,
    }),

  careerTriggerCtaClicked: (ctaType: string) =>
    trackEvent({
      eventName: 'career_trigger_cta_clicked',
      properties: { ctaType },
    }),

  careerRoadmapOpened: () => trackEvent({ eventName: 'career_roadmap_opened' }),
};
