import { apiClient } from '@/shared/config/api';

export interface EducationResource {
  _id: string;
  id?: string;
  title: string;
  provider?: string | null;
  type?: string | null;
  direction?: string | null;
  level?: string | null;
  city?: string | null;
  country?: string | null;
  url?: string | null;
  skillsTags?: unknown;
  durationWeeks?: number | null;
  price?: number | null;
  locationType?: 'online' | 'offline' | 'hybrid' | string | null;
  isFeatured?: boolean;
  isReskilling?: boolean;
  isInternational?: boolean;
}

export type UpdateEducationPayload = Partial<
  Pick<
    EducationResource,
    | 'title'
    | 'provider'
    | 'type'
    | 'direction'
    | 'level'
    | 'city'
    | 'country'
    | 'url'
    | 'skillsTags'
    | 'durationWeeks'
    | 'price'
    | 'locationType'
    | 'isFeatured'
    | 'isReskilling'
    | 'isInternational'
  >
>;

export type CreateEducationPayload = UpdateEducationPayload & {
  title: string;
};

export interface EducationsFilters {
  direction?: string;
  level?: string;
  type?: string;
  locationType?: string;
  location?: 'kz' | 'abroad' | 'online';
  price?: 'free' | 'paid';
}

interface EducationsResponse {
  filters: Record<string, string | undefined>;
  count: number;
  resources: EducationResource[];
}

export async function fetchEducations(
  filters: EducationsFilters = {}
): Promise<EducationResource[]> {
  const params: Record<string, string> = {};
  if (filters.direction) params.direction = filters.direction;
  if (filters.level) params.level = filters.level;
  if (filters.type) params.type = filters.type;
  if (filters.locationType) params.location = filters.locationType;
  if (filters.price === 'free') params.price = '0';

  const { data } = await apiClient.get<EducationsResponse>('/learning', {
    params,
  });

  return data.resources.filter((resource) => {
    if (filters.price === 'paid' && (resource.price ?? 0) <= 0) return false;
    if (filters.location === 'online') {
      return resource.locationType === 'online';
    }
    if (filters.location === 'abroad') {
      return resource.isInternational === true;
    }
    if (filters.location === 'kz') {
      return (
        resource.isInternational !== true &&
        resource.locationType !== 'online' &&
        (!resource.country ||
          ['kazakhstan', 'kz', 'қазақстан', 'казахстан'].includes(
            resource.country.trim().toLowerCase()
          ))
      );
    }
    return true;
  });
}

export async function deleteEducation(id: string): Promise<void> {
  await apiClient.delete(`/career/learning-resources/${id}`);
}

export async function fetchEducationById(
  id: string
): Promise<EducationResource> {
  const { data } = await apiClient.get<EducationResource>(
    `/career/learning-resources/${id}`
  );
  return data;
}

export async function updateEducation(
  id: string,
  payload: UpdateEducationPayload
): Promise<EducationResource> {
  const { data } = await apiClient.put<EducationResource>(
    `/career/learning-resources/${id}`,
    payload
  );
  return data;
}

export async function createEducation(
  payload: CreateEducationPayload
): Promise<EducationResource> {
  const { data } = await apiClient.post<EducationResource>(
    '/career/learning-resources',
    payload
  );
  return data;
}
