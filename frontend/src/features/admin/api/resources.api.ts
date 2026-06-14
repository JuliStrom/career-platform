import type {
  Direction,
  GrowthSpeed,
  JobWorkFormat,
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
