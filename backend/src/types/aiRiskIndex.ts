import type { Direction, Level } from './profileEnums';

export enum AiRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/** Запись справочника AI Sustainability Index (Блок 4) */
export interface IAiRiskIndex {
  direction: Direction;
  level: Level;
  riskLevel: AiRiskLevel;
  riskScore: number;
  riskDescription: string;
  protectiveSkills: string[];
}
