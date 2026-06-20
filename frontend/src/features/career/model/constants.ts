import { DIRECTION_VALUES, LEVEL_VALUES } from '@/shared/model';
import { ActionType } from './enums';
import type { CareerAbroadProgress } from './types';

export const ACTION_TYPE_VALUES = Object.values(ActionType) as ActionType[];
export const DIRECTION_FILTER_VALUES = ['All', ...DIRECTION_VALUES] as const;
export const LEVEL_FILTER_VALUES = ['All', ...LEVEL_VALUES] as const;
export const IS_ACTIVE_FILTER_VALUES = ['All', 'Active', 'Inactive'] as const;
export const COUNTRY_LOCATION_TERMS: Record<string, string[]> = {
  usa: ['USA', 'United States', 'США'],
  canada: ['Canada', 'Канада'],
  germany: ['Germany', 'Германия'],
  russia: ['Russia', 'Россия'],
  china: ['China', 'Китай'],
  dubai: ['Dubai', 'Дубай', 'UAE', 'ОАЭ'],
  europe: ['Europe', 'Европа'],
  other: [],
};

export const EMPTY_ROUTE_VALUE = '—';

export const PORTFOLIO_RESOURCES = [
  { label: 'Behance', url: 'https://www.behance.net/' },
  { label: 'Dribbble', url: 'https://dribbble.com/' },
  { label: 'Tilda', url: 'https://tilda.cc/' },
  { label: 'Wix', url: 'https://www.wix.com/' },
  { label: 'Canva', url: 'https://www.canva.com/' },
];

export const PROGRESS_CHECKLIST_ITEMS = [
  {
    id: 'portfolio',
    labelKey: 'portfolio',
  },
  {
    id: 'certificate',
    labelKey: 'certificate',
  },
  {
    id: 'linkedin',
    labelKey: 'linkedin',
  },
  {
    id: 'companies',
    labelKey: 'companies',
  },
  {
    id: 'visa',
    labelKey: 'visa',
  },
] as const;

export const VISA_OPTIONS = [
  {
    id: 'visaCenter',
    labelKey: 'visaCenter',
    costRange: '$1,500-3,500',
    timeline: '2-6 weeks',
    centersUrl:
      'https://2gis.kz/almaty/search/%D0%92%D0%B8%D0%B7%D0%BE%D0%B2%D1%8B%D0%B5%20%D1%86%D0%B5%D0%BD%D1%82%D1%80%D1%8B/rubricId/112424',
  },
  {
    id: 'employerSponsored',
    labelKey: 'employerSponsored',
    costRange: '$0-800',
    timeline: '4-12 weeks',
    centersUrl: null,
  },
] as const;

export const LINKEDIN_RECOMMENDATION_KEYS = [
  'photoBanner',
  'headline',
  'about',
  'experience',
  'skills',
  'openToWork',
] as const;

export const DEFAULT_PROGRESS: CareerAbroadProgress = {
  completed: {
    portfolio: false,
    certificate: false,
    linkedin: false,
    companies: false,
    visa: false,
  },
  portfolioUrl: '',
  portfolioPdfName: '',
  linkedinUrl: '',
  certificateLinks: [],
  certificatePdfs: [],
};
