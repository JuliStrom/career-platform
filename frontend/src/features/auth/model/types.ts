import { UserRole } from '@/shared/model';
import { LoginFormData } from './schemas';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type RegisterPayload = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  inviteCode?: string;
};

export interface RegisterWithInvitePayload {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface InviteValidationResponse {
  valid: boolean;
  role?: string;
  accessType?: string;
  expiresAt?: string | null;
  error?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/** Данные от Telegram Login Widget (отправляются на бэкенд для проверки hash) */
export interface TelegramAuthPayload {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isInitializing: boolean;
  isLoading: boolean;
  authError: string | null;
}

export type AuthMode = 'login' | 'register';

export interface AuthFormValues extends LoginFormData {
  confirmPassword?: string;
}
