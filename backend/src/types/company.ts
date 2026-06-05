import { Document } from 'mongoose';
import { WorkFormat } from './jobEnums';

export enum GrowthSpeed {
  SLOW = 'Slow',
  MEDIUM = 'Medium',
  FAST = 'Fast',
}

export enum TeamSize {
  ONE_TO_TEN = '1-10',
  ELEVEN_TO_FIFTY = '11-50',
  FIFTY_ONE_TO_TWO_HUNDRED = '51-200',
  TWO_HUNDRED_PLUS = '200+',
}

export enum WorkLanguage {
  RU = 'RU',
  EN = 'EN',
  KZ = 'KZ',
}

export interface ICompany extends Document {
  name: string;
  logo?: string | null;
  workFormat: WorkFormat;
  valuesTags: string[];
  growthSpeed: GrowthSpeed;
  teamSize: TeamSize;
  languages: WorkLanguage[];
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CompanyCultureBody = {
  name: string;
  logo?: string | null;
  workFormat: WorkFormat;
  valuesTags: string[];
  growthSpeed: GrowthSpeed;
  teamSize: TeamSize;
  languages: WorkLanguage[];
  description: string;
};
