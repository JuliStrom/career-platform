import { apiClient } from '@/shared/config/api';

export type UserRole = 'SPECIALIST' | 'ADMIN';

export interface AdminUser {
  _id: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  isDeleted: boolean;
  isSubscribed?: boolean;
  createdAt: string;
  profile?: {
    name?: string;
    avatar?: string | null;
  } | null;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface GetUsersResponse {
  total: number;
  page: number;
  limit: number;
  users: AdminUser[];
}

export async function fetchUsers(
  params?: GetUsersParams
): Promise<GetUsersResponse> {
  const { data } = await apiClient.get<GetUsersResponse>('/users', {
    params: params ?? {},
  });
  return data;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/users/${userId}/role`, {
    role,
  });
  return data;
}

export async function updateUserBlock(
  userId: string,
  blocked: boolean
): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/users/${userId}/block`, {
    blocked,
  });
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
