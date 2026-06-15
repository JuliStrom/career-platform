import { apiClient } from '@/shared/config/api';
import {
  CreateJobPayload,
  FavoriteActionResponse,
  FavoriteJobsResponse,
  IJobsFilters,
  JobsListResponse,
  Job,
} from '../model';

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const response = await apiClient.post<Job>('/jobs', payload);
  return response.data;
}

export async function getJobs(
  filters?: IJobsFilters
): Promise<JobsListResponse> {
  const response = await apiClient.get<JobsListResponse>('/jobs', {
    params: filters,
  });

  return response.data;
}

export async function getJobById(id: string): Promise<Job> {
  const response = await apiClient.get<Job>(`/jobs/${id}`);
  return response.data;
}

export async function updateJob(
  id: string,
  payload: CreateJobPayload
): Promise<Job> {
  const response = await apiClient.put<Job>(`/jobs/${id}`, payload);
  return response.data;
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`);
}

export async function getFavoriteJobs(): Promise<FavoriteJobsResponse> {
  const response = await apiClient.get<FavoriteJobsResponse>('/jobs/favorites');
  return response.data;
}

export async function addJobToFavorites(
  id: string
): Promise<FavoriteActionResponse> {
  const response = await apiClient.post<FavoriteActionResponse>(
    `/jobs/${id}/favorite`
  );
  return response.data;
}

export async function removeJobFromFavorites(
  id: string
): Promise<FavoriteActionResponse> {
  const response = await apiClient.delete<FavoriteActionResponse>(
    `/jobs/${id}/favorite`
  );
  return response.data;
}
