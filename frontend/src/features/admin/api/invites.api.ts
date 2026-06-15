import { apiClient } from '@/shared/config/api';

export interface Invite {
  id: string;
  code: string;
  createdBy?: { email?: string };
  role: 'SPECIALIST' | 'ADMIN';
  accessType: 'INVITE_ONLY' | 'TRIAL';
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateInvitePayload {
  role: 'SPECIALIST' | 'ADMIN';
  accessType?: 'INVITE_ONLY' | 'TRIAL';
  maxUses?: number;
  expiresAt?: string | null;
}

export interface CreateInviteResponse {
  code: string;
  link: string;
}

export async function fetchInvites(): Promise<Invite[]> {
  const { data } = await apiClient.get<Invite[]>('/admin/invites');
  return data;
}

export async function createInvite(
  payload: CreateInvitePayload
): Promise<CreateInviteResponse> {
  const { data } = await apiClient.post<CreateInviteResponse>(
    '/admin/invites',
    payload
  );
  return data;
}

export async function deactivateInvite(id: string): Promise<void> {
  await apiClient.patch(`/admin/invites/${id}/deactivate`, {});
}
