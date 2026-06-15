import { Document, Types } from 'mongoose';
import { Direction, Level } from './profileEnums';
import { WorkFormat } from './jobEnums';
import { CompanyCultureBody, ICompany } from './company';

// Интерфейс для Mongoose модели Job
export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  companyId?: Types.ObjectId | ICompany | null;
  direction: Direction;
  level: Level;
  workFormat: WorkFormat;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  requirements: string[];
  responsibilities: string[];
  createdBy?: Types.ObjectId | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Типы для request body
export type CreateJobBody = {
  title: string;
  description: string;
  company: string;
  companyId?: string;
  companyCulture?: CompanyCultureBody;
  direction: Direction;
  level: Level;
  workFormat: WorkFormat;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  requirements: string[];
  responsibilities: string[];
};

export type UpdateJobBody = Partial<CreateJobBody> & {
  isActive?: boolean;
};

// Типы для фильтров
export type JobFilters = {
  direction?: Direction;
  level?: Level;
  workFormat?: WorkFormat;
  location?: string;
  isActive?: boolean;
};
