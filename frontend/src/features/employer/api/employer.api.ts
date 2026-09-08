import { apiClient } from '@/shared/config/api';
import { isAxiosError } from 'axios';
import type {
  Company,
  CompanyPayload,
  ContactSpecialistPayload,
  CreateEmployerJobPayload,
  EmployerJobPayload,
  EmployerJobsResponse,
  EmployerProfile,
  EmployerProfilePayload,
  SpecialistFilters,
  SpecialistsResponse,
} from '../model';
import type { Job } from '@/features/jobs/model';

export async function getCompany(): Promise<Company | null> {
  try {
    const response = await apiClient.get<{ company: Company }>(
      '/employer/company'
    );
    return response.data.company;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createCompany(payload: CompanyPayload): Promise<Company> {
  const response = await apiClient.post<{ company: Company }>(
    '/employer/company',
    payload
  );
  return response.data.company;
}

export async function updateCompany(payload: CompanyPayload): Promise<Company> {
  const response = await apiClient.put<{ company: Company }>(
    '/employer/company',
    payload
  );
  return response.data.company;
}

export async function getOwnJobs(): Promise<EmployerJobsResponse> {
  const response = await apiClient.get<EmployerJobsResponse>('/employer/jobs');
  return response.data;
}

export async function createOwnJob(
  payload: CreateEmployerJobPayload
): Promise<Job> {
  const response = await apiClient.post<Job>('/employer/jobs', payload);
  return response.data;
}

export async function getOwnJob(id: string): Promise<Job> {
  const response = await apiClient.get<Job>(`/employer/jobs/${id}`);
  return response.data;
}

export async function updateOwnJob(
  id: string,
  payload: Partial<EmployerJobPayload>
): Promise<Job> {
  const response = await apiClient.put<Job>(`/employer/jobs/${id}`, payload);
  return response.data;
}

export async function deactivateOwnJob(id: string): Promise<void> {
  await apiClient.delete(`/employer/jobs/${id}`);
}

export async function getEmployerProfile(): Promise<EmployerProfile | null> {
  try {
    const response = await apiClient.get<{ profile: EmployerProfile }>(
      '/employer/profile'
    );
    return response.data.profile;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createEmployerProfile(
  payload: EmployerProfilePayload
): Promise<EmployerProfile> {
  const response = await apiClient.post<{ profile: EmployerProfile }>(
    '/employer/profile',
    payload
  );
  return response.data.profile;
}

export async function updateEmployerProfile(
  payload: EmployerProfilePayload
): Promise<EmployerProfile> {
  const response = await apiClient.put<{ profile: EmployerProfile }>(
    '/employer/profile',
    payload
  );
  return response.data.profile;
}

export async function listSpecialists(
  filters: SpecialistFilters,
  page = 1
): Promise<SpecialistsResponse> {
  const response = await apiClient.get<SpecialistsResponse>(
    '/employer/specialists',
    { params: { ...filters, page, limit: 20 } }
  );
  return response.data;
}

export async function contactSpecialist(
  profileId: string,
  payload: ContactSpecialistPayload
): Promise<void> {
  await apiClient.post(`/employer/specialists/${profileId}/contact`, payload);
}
