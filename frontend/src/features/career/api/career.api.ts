import { apiClient } from '@/shared/config/api';
import {
  AiRiskIndexResponse,
  CareerChangeHubResponse,
  CareerRoadmapResponse,
  CareerTriggerResponse,
  CareerScenario,
  CreateCareerScenarioPayload,
  IScenariosFilters,
  Recommendation,
  RecommendationsResponse,
} from '../model';

export async function createCareerScenario(
  payload: CreateCareerScenarioPayload
): Promise<CareerScenario> {
  const response = await apiClient.post<CareerScenario>(
    '/career/scenarios',
    payload
  );
  return response.data;
}

export async function getRecommendations(): Promise<RecommendationsResponse> {
  const response = await apiClient.get<RecommendationsResponse>(
    '/career/recommendations'
  );
  return response.data;
}

export async function getCareerTrigger(): Promise<CareerTriggerResponse> {
  const response =
    await apiClient.get<CareerTriggerResponse>('/career/trigger');
  return response.data;
}

export async function getCareerRoadmap(): Promise<CareerRoadmapResponse> {
  const response =
    await apiClient.get<CareerRoadmapResponse>('/career/roadmap');
  return response.data;
}

export async function getAiRiskIndex(): Promise<AiRiskIndexResponse> {
  const response = await apiClient.get<AiRiskIndexResponse>('/career/ai-risk');
  return response.data;
}

export async function getCareerChangeHub(): Promise<CareerChangeHubResponse> {
  const response = await apiClient.get<CareerChangeHubResponse>(
    '/career/career-change-hub'
  );
  return response.data;
}

export async function getRecommendationById(
  id: string
): Promise<Recommendation> {
  const response = await apiClient.get<Recommendation>(
    `/career/recommendations/${id}`
  );
  return response.data;
}

export async function getScenarios(
  filters?: IScenariosFilters
): Promise<CareerScenario[]> {
  const response = await apiClient.get<CareerScenario[]>('/career/scenarios', {
    params: filters,
  });
  return response.data;
}

export async function getScenarioById(id: string): Promise<CareerScenario> {
  const response = await apiClient.get<CareerScenario>(
    `/career/scenarios/${id}`
  );
  return response.data;
}

export async function updateScenario(
  id: string,
  payload: CreateCareerScenarioPayload
): Promise<CareerScenario> {
  const response = await apiClient.put<CareerScenario>(
    `/career/scenarios/${id}`,
    payload
  );
  return response.data;
}

export async function deleteScenario(id: string): Promise<void> {
  await apiClient.delete(`/career/scenarios/${id}`);
}
