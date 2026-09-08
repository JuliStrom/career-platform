export enum JobWorkFormat {
  Office = 'Office',
  Remote = 'Remote',
  Hybrid = 'Hybrid',
}

export enum GrowthSpeed {
  Slow = 'Slow',
  Medium = 'Medium',
  Fast = 'Fast',
}

export enum TeamSize {
  OneToTen = '1-10',
  ElevenToFifty = '11-50',
  FiftyOneToTwoHundred = '51-200',
  TwoHundredPlus = '200+',
}

export enum WorkLanguage {
  RU = 'RU',
  EN = 'EN',
  KZ = 'KZ',
}

/** Блок 5 ТЗ — трек «Меняю профессию» */
export enum CareerChangeAgeRange {
  UpTo30 = 'up_to_30',
  From30To40 = '30_40',
  From40To50 = '40_50',
  From50Plus = '50_plus',
}

export enum CareerChangeMotivation {
  AiThreat = 'ai_threat',
  EarnMore = 'earn_more',
  Remote = 'remote',
  Burnout = 'burnout',
  Other = 'other',
}

export enum CareerChangeTimeline {
  UpTo6Months = 'up_to_6_months',
  Months6To12 = '6_12_months',
  Years1To2 = '1_2_years',
  JustStudying = 'just_studying',
}

export enum Direction {
  Creative = 'Creative',
  IT = 'IT',
  Design = 'Design',
  ECommerce = 'E-commerce',
  HoReCa = 'HoReCa',
  ArchitectureDesign = 'Architecture & Design',
  Production = 'Production',
  Marketing = 'Marketing',
  SalesBusinessDevelopment = 'Sales & Business Development',
  FinanceAccounting = 'Finance & Accounting',
  HRPeople = 'HR & People',
  OperationsLogistics = 'Operations & Logistics',
  Education = 'Education',
  LegalCompliance = 'Legal & Compliance',
}

export enum Level {
  Junior = 'Junior',
  Middle = 'Middle',
  Senior = 'Senior',
  Lead = 'Lead',
}

export enum UserRole {
  SPECIALIST = 'SPECIALIST',
  ADMIN = 'ADMIN',
}

/** Путь в продукте: работодатель/заказчик или специалист. */
export enum UserType {
  EMPLOYER = 'employer',
  SPECIALIST = 'specialist',
}

/** Тип задач, которые обычно даёт заказчик. */
export enum EmployerTaskType {
  Project = 'project',
  Hire = 'hire',
  OneOff = 'one_off',
}

export enum EmployerBudgetRange {
  UpTo500k = 'up_to_500k',
  From500kTo1m = '500k_1m',
  From1mTo3m = '1m_3m',
  From3mPlus = '3m_plus',
}

/** Формат сотрудничества в поиске специалистов. */
export enum SpecialistWorkFormat {
  Hire = 'hire',
  Project = 'project',
}

export enum EmployerContactKind {
  Message = 'message',
  ProjectOffer = 'project_offer',
}

export enum CareerGoal {
  Growth = 'Growth',
  Leadership = 'Leadership',
  Expertise = 'Expertise',
  CareerChange = 'Career Change',
  SkillDevelopment = 'Skill Development',
}

export enum City {
  Almaty = 'almaty',
  Astana = 'astana',
  Shymkent = 'shymkent',
  OtherKz = 'other_kz',
  Abroad = 'abroad',
}

export enum EmploymentType {
  Fulltime = 'fulltime',
  Freelance = 'freelance',
  Business = 'business',
  Searching = 'searching',
  Reskilling = 'reskilling',
}

export enum ProfileLang {
  RU = 'ru',
  EN = 'en',
}
