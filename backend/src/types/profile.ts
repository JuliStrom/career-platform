import { Document, Types } from 'mongoose';
import {
  CareerChangeAgeRange,
  CareerChangeMotivation,
  CareerChangeTimeline,
} from './careerChangeTrack';
import { Direction, Level, CareerGoal, City, EmploymentType, ProfileLang } from './profileEnums';

export type ProfileWorkplace = {
  company: string;
  position: string;
  period: string;
  achievement: string;
  projects?: ProfileExperienceProject[];
};

export type ProfileExperienceProject = {
  name: string;
  role: string;
  result: string;
  link?: string;
};

/**
 * ТЗ блок 1 — профиль специалиста: поля ниже + валидация в profile.schema;
 * yearsInCurrentRole не в БД (виртуал в Profile). Имена в REST — camelCase (аналог snake_case из ТЗ).
 */
// Profile Model
export interface IProfile extends Document {
  userId: Types.ObjectId;
  name: string;
  avatar?: string | null;
  portfolioPdfData?: Buffer | null;
  portfolioPdfContentType?: string | null;
  portfolioPdfName?: string | null;
  certificatePdfs?: {
    _id?: Types.ObjectId;
    name: string;
    contentType: string;
    data: Buffer;
    uploadedAt: Date;
  }[];
  directions: Direction[];
  level: Level;
  skills: string[];
  experience: string;
  workplaces: ProfileWorkplace[];
  projects: ProfileExperienceProject[];
  careerGoal: CareerGoal;
  /** Дата начала текущей позиции (для триггеров роста и yearsInCurrentRole) */
  careerStartDate?: Date | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  currentAchievement?: string | null;
  city?: City | null;
  relocationFromCity?: string | null;
  relocationToCountry?: string | null;
  employmentType?: EmploymentType | null;
  lang: ProfileLang;
  wantsRelocation: boolean;
  favoriteJobs?: Types.ObjectId[]; // Массив ID избранных вакансий (optional, по умолчанию [])
  /** Блок 5 — трек смены профессии */
  careerChangeTrackActive: boolean;
  careerChangeCurrentField?: string | null;
  careerChangeTargetDirection?: Direction | null;
  careerChangeAgeRange?: CareerChangeAgeRange | null;
  careerChangeMotivation?: CareerChangeMotivation | null;
  careerChangeTimeline?: CareerChangeTimeline | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Request типы для профиля
export type CreateProfileBody = {
  name: string;
  avatar?: string;
  directions: Direction[];
  level: Level;
  skills: string[];
  experience?: string;
  workplaces?: ProfileWorkplace[];
  projects?: ProfileExperienceProject[];
  careerGoal: CareerGoal;
  careerStartDate?: Date | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  currentAchievement?: string | null;
  city?: City | null;
  relocationFromCity?: string | null;
  relocationToCountry?: string | null;
  employmentType?: EmploymentType | null;
  lang?: ProfileLang;
  wantsRelocation?: boolean;
  careerChangeTrackActive?: boolean;
  careerChangeCurrentField?: string | null;
  careerChangeTargetDirection?: Direction | null;
  careerChangeAgeRange?: CareerChangeAgeRange | null;
  careerChangeMotivation?: CareerChangeMotivation | null;
  careerChangeTimeline?: CareerChangeTimeline | null;
};

export type UpdateProfileBody = {
  name?: string;
  avatar?: string;
  directions?: Direction[];
  level?: Level;
  skills?: string[];
  experience?: string;
  workplaces?: ProfileWorkplace[];
  projects?: ProfileExperienceProject[];
  careerGoal?: CareerGoal;
  careerStartDate?: Date | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  currentAchievement?: string | null;
  city?: City | null;
  relocationFromCity?: string | null;
  relocationToCountry?: string | null;
  employmentType?: EmploymentType | null;
  lang?: ProfileLang;
  wantsRelocation?: boolean;
  careerChangeTrackActive?: boolean;
  careerChangeCurrentField?: string | null;
  careerChangeTargetDirection?: Direction | null;
  careerChangeAgeRange?: CareerChangeAgeRange | null;
  careerChangeMotivation?: CareerChangeMotivation | null;
  careerChangeTimeline?: CareerChangeTimeline | null;
};
