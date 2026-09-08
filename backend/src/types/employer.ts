import { Document, Types } from "mongoose";
import { CompanyCultureBody } from "./company";
import { CreateJobBody } from "./job";
import { Direction } from "./profileEnums";

export enum EmployerTaskType {
  PROJECT = "project",
  HIRE = "hire",
  ONE_OFF = "one_off",
}

export enum EmployerBudgetRange {
  UP_TO_500K = "up_to_500k",
  FROM_500K_TO_1M = "500k_1m",
  FROM_1M_TO_3M = "1m_3m",
  FROM_3M_PLUS = "3m_plus",
}

export enum SpecialistWorkFormat {
  HIRE = "hire",
  PROJECT = "project",
}

export enum EmployerContactKind {
  MESSAGE = "message",
  PROJECT_OFFER = "project_offer",
}

export interface IEmployerProfile extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  industry: Direction;
  taskType: EmployerTaskType;
  budgetRange?: EmployerBudgetRange | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateEmployerProfileBody = {
  name: string;
  description: string;
  industry: Direction;
  taskType: EmployerTaskType;
  budgetRange?: EmployerBudgetRange | null;
};

export type UpdateEmployerProfileBody = Partial<CreateEmployerProfileBody>;

export type CreateEmployerCompanyBody = CompanyCultureBody;
export type UpdateEmployerCompanyBody = Partial<CreateEmployerCompanyBody>;

export type CreateEmployerJobBody = Omit<
  CreateJobBody,
  "company" | "companyId"
>;
export type UpdateEmployerJobBody = Partial<CreateEmployerJobBody> & {
  isActive?: boolean;
};

export type ContactSpecialistBody = {
  kind: EmployerContactKind;
  message?: string;
};
