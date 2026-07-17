import {
  CareerChangeAgeRange,
  CareerChangeMotivation,
  CareerChangeTimeline,
  CareerGoal,
  Direction,
  Level,
  UserRole,
} from '@/shared/model';
import type { CertificatePdfMetadata } from '@/features/profile/api/profile.api';
import {
  CreateCareerScenarioSchema,
  type CareerScenarioActionSchema,
} from './schemas';
import type {
  DIRECTION_FILTER_VALUES,
  IS_ACTIVE_FILTER_VALUES,
  LEVEL_FILTER_VALUES,
  PROGRESS_CHECKLIST_ITEMS,
  VISA_OPTIONS,
} from './constants';

export type CareerScenarioAction = CareerScenarioActionSchema;

export type CreateCareerScenarioPayload = CreateCareerScenarioSchema;

export interface CareerScenarioAuthor {
  _id: string;
  email: string;
  role: UserRole;
}

export interface CareerScenario {
  _id: string;
  direction: Direction;
  level: Level;
  translationKey?: string | null;
  title: string;
  description: string;
  actions: CareerScenarioAction[];
  /** После populate — объект с email; иначе может отсутствовать или быть только id */
  createdBy?: CareerScenarioAuthor | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRecommendation {
  direction: Direction;
  level: Level;
  careerGoal: CareerGoal;
}

export type Recommendation = Omit<CareerScenario, 'createdBy'>;

export interface RecommendationsResponse {
  profile: ProfileRecommendation;
  recommendations: Recommendation[];
}

export type CareerTriggerCta = 'consultation' | 'roadmap' | 'courses';

export interface CareerTriggerNextStep {
  title: string;
  description?: string;
}

export interface CareerTriggerCard {
  id: string;
  triggerTitle: string;
  triggerDescription: string;
  nextSteps: CareerTriggerNextStep[];
  primaryCta: CareerTriggerCta;
  ctaButtons: {
    type: CareerTriggerCta;
    label: string;
  }[];
  matchReason:
    | 'reskilling_employment'
    | 'career_change_goal'
    | 'level_and_tenure';
}

export interface CareerTriggerResponse {
  yearsInCurrentRole: number | null;
  trigger: CareerTriggerCard | null;
}

export type RoadmapBranchType = 'technical' | 'management' | 'entrepreneurship';

export interface LearningResourceRoadmap {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  tags: string[];
  matchedSkills: string[];
}

export interface CareerRoadmap {
  id: string;
  direction: Direction;
  fromLevel: Level;
  toLevel: Level;
  toRole: string;
  skillsToDevelop: string[];
  estimatedTimeMonths: number;
  estimatedTimeMonthsMax: number | null;
  branchType: RoadmapBranchType;
  careerBranches: string[];
  learningResources: LearningResourceRoadmap[];
}

export interface CareerRoadmapResponse {
  profileContext: {
    direction: Direction;
    fromLevel: Level;
  };
  roadmaps: CareerRoadmap[];
}

/** AI Sustainability Index (lookup по профилю) */
export type AiRiskLevel = 'low' | 'medium' | 'high';

export interface AiRiskIndexResponse {
  profile: {
    direction: Direction;
    level: Level;
  };
  id: string;
  riskLevel: AiRiskLevel;
  riskScore: number;
  riskDescription: string;
  protectiveSkills: string[];
  updatedAt: string;
}

/** Элемент хаба «Меняю профессию» (learning resources с тегом career_change) */
export interface CareerChangeHubResource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  tags: string[];
}

export interface CareerChangeGovernmentProgram {
  id: string;
  title: string;
  description: string;
  url: string;
  region: 'kz';
}

export interface CareerChangeSuccessStory {
  id: string;
  title: string;
  summary: string;
  ageRange: string;
}

export interface CareerChangeHubResponse {
  tone: 'supportive';
  intro: { title: string; body: string };
  track: {
    currentField: string | null;
    targetDirection: Direction | null;
    ageRange: CareerChangeAgeRange | null;
    motivation: CareerChangeMotivation | null;
    timeline: CareerChangeTimeline | null;
  };
  governmentPrograms: CareerChangeGovernmentProgram[];
  learningFromScratch: CareerChangeHubResource[];
  learningGeneral: CareerChangeHubResource[];
  internshipsKz: CareerChangeHubResource[];
  internshipsAbroad: CareerChangeHubResource[];
  successStories: CareerChangeSuccessStory[];
  successStoryResources: CareerChangeHubResource[];
}

export interface IScenariosFilters {
  direction?: Direction;
  level?: Level;
  isActive?: boolean;
}

export interface ScenariosListResponse {
  scenarios: CareerScenario[];
}

export type DirectionFilterValue = (typeof DIRECTION_FILTER_VALUES)[number];
export type LevelFilterValue = (typeof LEVEL_FILTER_VALUES)[number];
export type IsActiveFilterValue = (typeof IS_ACTIVE_FILTER_VALUES)[number];

export type ProgressChecklistItemId =
  (typeof PROGRESS_CHECKLIST_ITEMS)[number]['id'];

export type VisaOptionId = (typeof VISA_OPTIONS)[number]['id'];

export interface CareerAbroadProgress {
  completed: Record<ProgressChecklistItemId, boolean>;
  portfolioUrl: string;
  portfolioPdfName: string;
  linkedinUrl: string;
  certificateLinks: {
    id: string;
    title: string;
    url: string;
    description: string;
  }[];
  certificatePdfs: CertificatePdfMetadata[];
}

export interface CompanySummary {
  name: string;
  vacanciesCount: number;
  locations: string[];
}

export interface CertificateDraft {
  title: string;
  url: string;
  description: string;
}
