import { Direction } from '@/shared/model';

export const EDUCATION_DIRECTION_OPTIONS = [
  'All',
  ...Object.values(Direction),
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  'All',
  'Beginner',
  'Middle',
  'Advanced',
  '\u041b\u044e\u0431\u043e\u0439',
] as const;

export const EDUCATION_TYPE_OPTIONS = [
  'All',
  'course',
  'internship',
  'grant',
  'event',
] as const;

export const EDUCATION_FORMAT_OPTIONS = [
  'All',
  'online',
  'offline',
  'hybrid',
] as const;

export const EDUCATION_LOCATION_OPTIONS = [
  'All',
  'kz',
  'abroad',
  'online',
] as const;

export const EDUCATION_PRICE_OPTIONS = ['All', 'free', 'paid'] as const;
