import { Request } from 'express';

// Роли пользователей (права доступа: админка vs обычный пользователь)
export enum UserRole {
  SPECIALIST = 'SPECIALIST',
  ADMIN = 'ADMIN',
}

/** Путь в продукте: работодатель/заказчик или специалист. Выбирается при регистрации. */
export enum UserType {
  EMPLOYER = 'employer',
  SPECIALIST = 'specialist',
}

// JWT Payload для Access Token
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  userType?: UserType;
  type: 'access'; // Тип токена
}

// JWT Payload для Refresh Token
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string; // ID refresh token в БД
  type: 'refresh'; // Тип токена
}

// User данные для req.user (без type)
export interface UserPayload {
  userId: string;
  email: string;
  role: UserRole;
  userType?: UserType | null;
  isSubscribed?: boolean;
}

// Express Request с user
export interface AuthRequest<T = {}, U = {}, V = {}> extends Request<T, U, V> {
  user?: UserPayload;
}

// Провайдер входа (email + пароль, Google, Telegram)
export type AuthProvider = 'email' | 'google' | 'telegram';

// Request типы для авторизации
export type RegisterBody = {
  name?: string;
  email: string;
  password: string;
  inviteCode?: string;
  userType?: UserType;
};

export type LoginBody = {
  email: string;
  password: string;
};

/** Тело запроса для входа через Google (id_token от Google Sign-In) */
export type GoogleAuthBody = {
  idToken: string;
  inviteCode?: string;
};

/** Данные от Telegram Login Widget (после проверки hash на бэкенде) */
export type TelegramAuthPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};
