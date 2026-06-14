import type {
  Direction,
  GrowthSpeed,
  JobWorkFormat,
  Level,
  TeamSize,
  WorkLanguage,
} from '@/shared/model';
import { apiClient } from '@/shared/config/api';

export interface CareerRouteResource {
  _id: string;
  direction: Direction;
  fromCity?: string | null;
  toCountry: string;
  title: string;
  steps: unknown;
  resources: unknown;
  isFeatured: boolean;
}

export type CareerRoutePayload = Omit<CareerRouteResource, '_id'>;

export interface CompanyResource {
  _id: string;
  name: string;
  logo?: string | null;
  workFormat: JobWorkFormat;
  valuesTags: string[];
  growthSpeed: GrowthSpeed;
  teamSize: TeamSize;
  languages: WorkLanguage[];
  description: string;
}

export type CompanyPayload = Omit<CompanyResource, '_id'>;

export type AiRiskLevel = 'low' | 'medium' | 'high';

export interface AiRiskIndexResource {
  _id: string;
  direction: Direction;
  level: Level;
  riskLevel: AiRiskLevel;
  riskScore: number;
  riskDescription: string;
  protectiveSkills: string[];
}

export type AiRiskIndexPayload = Omit<AiRiskIndexResource, '_id'>;

export type CareerTriggerCta = 'consultation' | 'roadmap' | 'courses';
export type CareerTriggerSpecialCase =
  | 'career_change_retraining'
  | 'reskilling_track_40';

export interface CareerTriggerNextStep {
  title: string;
  description?: string;
}

export interface CareerTriggerResource {
  _id: string;
  direction: Direction | null;
  currentLevel: Level | null;
  minYears: number | null;
  triggerTitle: string;
  triggerDescription: string;
  nextSteps: CareerTriggerNextStep[];
  ctaType: CareerTriggerCta;
  specialCase?: CareerTriggerSpecialCase;
  isActive: boolean;
  sortOrder: number;
}

export type CareerTriggerPayload = Omit<CareerTriggerResource, '_id'>;

export type RoadmapBranchType = 'technical' | 'management' | 'entrepreneurship';

export interface CareerRoadmapResource {
  _id: string;
  direction: Direction;
  fromLevel: Level;
  toLevel: Level;
  toRole: string;
  skillsToDevelop: string[];
  estimatedTimeMonths: number;
  estimatedTimeMonthsMax?: number | null;
  branchType: RoadmapBranchType;
  careerBranches: string[];
  learningResourceIds: string[];
  isActive: boolean;
  sortOrder: number;
}

export type CareerRoadmapPayload = Omit<CareerRoadmapResource, '_id'>;

export async function fetchCareerRoutes(): Promise<CareerRouteResource[]> {
  const response = await apiClient.get<CareerRouteResource[]>(
    '/career/career-routes'
  );
  return response.data;
}

export async function fetchCareerRoute(
  id: string
): Promise<CareerRouteResource> {
  const response = await apiClient.get<CareerRouteResource>(
    `/career/career-routes/${id}`
  );
  return response.data;
}

export async function createCareerRoute(
  payload: CareerRoutePayload
): Promise<CareerRouteResource> {
  const response = await apiClient.post<CareerRouteResource>(
    '/career/career-routes',
    payload
  );
  return response.data;
}

export async function updateCareerRoute(
  id: string,
  payload: CareerRoutePayload
): Promise<CareerRouteResource> {
  const response = await apiClient.put<CareerRouteResource>(
    `/career/career-routes/${id}`,
    payload
  );
  return response.data;
}

export async function deleteCareerRoute(id: string): Promise<void> {
  await apiClient.delete(`/career/career-routes/${id}`);
}

export async function fetchCompanies(
  search?: string
): Promise<CompanyResource[]> {
  const response = await apiClient.get<CompanyResource[]>('/admin/companies', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function fetchCompany(id: string): Promise<CompanyResource> {
  const response = await apiClient.get<CompanyResource>(
    `/admin/companies/${id}`
  );
  return response.data;
}

export async function createCompany(
  payload: CompanyPayload
): Promise<CompanyResource> {
  const response = await apiClient.post<CompanyResource>(
    '/admin/companies',
    payload
  );
  return response.data;
}

export async function updateCompany(
  id: string,
  payload: CompanyPayload
): Promise<CompanyResource> {
  const response = await apiClient.put<CompanyResource>(
    `/admin/companies/${id}`,
    payload
  );
  return response.data;
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/admin/companies/${id}`);
}

export async function fetchAiRiskIndexes(): Promise<AiRiskIndexResource[]> {
  const response = await apiClient.get<AiRiskIndexResource[]>(
    '/admin/ai-risk-index'
  );
  return response.data;
}

export async function fetchAiRiskIndex(
  id: string
): Promise<AiRiskIndexResource> {
  const response = await apiClient.get<AiRiskIndexResource>(
    `/admin/ai-risk-index/${id}`
  );
  return response.data;
}

export async function createAiRiskIndex(
  payload: AiRiskIndexPayload
): Promise<AiRiskIndexResource> {
  const response = await apiClient.post<AiRiskIndexResource>(
    '/admin/ai-risk-index',
    payload
  );
  return response.data;
}

export async function updateAiRiskIndex(
  id: string,
  payload: AiRiskIndexPayload
): Promise<AiRiskIndexResource> {
  const response = await apiClient.put<AiRiskIndexResource>(
    `/admin/ai-risk-index/${id}`,
    payload
  );
  return response.data;
}

export async function deleteAiRiskIndex(id: string): Promise<void> {
  await apiClient.delete(`/admin/ai-risk-index/${id}`);
}

export async function fetchCareerTriggers(): Promise<CareerTriggerResource[]> {
  const response = await apiClient.get<CareerTriggerResource[]>(
    '/admin/career-triggers'
  );
  return response.data;
}

export async function fetchCareerTrigger(
  id: string
): Promise<CareerTriggerResource> {
  const response = await apiClient.get<CareerTriggerResource>(
    `/admin/career-triggers/${id}`
  );
  return response.data;
}

export async function createCareerTrigger(
  payload: CareerTriggerPayload
): Promise<CareerTriggerResource> {
  const response = await apiClient.post<CareerTriggerResource>(
    '/admin/career-triggers',
    payload
  );
  return response.data;
}

export async function updateCareerTrigger(
  id: string,
  payload: CareerTriggerPayload
): Promise<CareerTriggerResource> {
  const response = await apiClient.put<CareerTriggerResource>(
    `/admin/career-triggers/${id}`,
    payload
  );
  return response.data;
}

export async function deleteCareerTrigger(id: string): Promise<void> {
  await apiClient.delete(`/admin/career-triggers/${id}`);
}

export async function fetchCareerRoadmaps(): Promise<CareerRoadmapResource[]> {
  const response =
    await apiClient.get<CareerRoadmapResource[]>('/career/roadmaps');
  return response.data;
}

export async function fetchCareerRoadmap(
  id: string
): Promise<CareerRoadmapResource> {
  const response = await apiClient.get<CareerRoadmapResource>(
    `/career/roadmaps/${id}`
  );
  return response.data;
}

export async function createCareerRoadmap(
  payload: CareerRoadmapPayload
): Promise<CareerRoadmapResource> {
  const response = await apiClient.post<CareerRoadmapResource>(
    '/career/roadmaps',
    payload
  );
  return response.data;
}

export async function updateCareerRoadmap(
  id: string,
  payload: CareerRoadmapPayload
): Promise<CareerRoadmapResource> {
  const response = await apiClient.put<CareerRoadmapResource>(
    `/career/roadmaps/${id}`,
    payload
  );
  return response.data;
}

export async function deleteCareerRoadmap(id: string): Promise<void> {
  await apiClient.delete(`/career/roadmaps/${id}`);
}
