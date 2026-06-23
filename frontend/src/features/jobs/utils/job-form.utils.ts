import {
  CreateJobPayload,
  DEFAULT_CURRENCY,
  type CreateJobFormValues,
  type JobSalary,
} from '@/features/jobs/model';
import { Direction, JobWorkFormat, Level } from '@/shared/model';
import { formatListInput } from './parse-list.utils';

const JOB_TITLE_TRANSLATION_KEYS: Record<string, string> = {
  'Frontend-разработчик (React)': 'jobTitles.frontendReact',
  'UX/UI дизайнер': 'jobTitles.uxUiDesigner',
  'Product Manager': 'jobTitles.productManager',
  'Менеджер по продажам в HoReCa': 'jobTitles.horecaSalesManager',
  'Backend-разработчик (Node.js)': 'jobTitles.backendNode',
  'Специалист по работе с клиентами в Сбербанке':
    'jobTitles.sberbankClientSpecialist',
  'Sales Manager': 'jobTitles.salesManager',
  'Оператор пищевого производства': 'jobTitles.foodProductionOperator',
  'Рабочий на строительный объект': 'jobTitles.constructionWorker',
  'Графический дизайнер': 'jobTitles.graphicDesignerRu',
  'Software Developer': 'jobTitles.softwareDeveloper',
  'Graphic Designer': 'jobTitles.graphicDesigner',
  'Motion Designer': 'jobTitles.motionDesigner',
  'Full Stack Developer': 'jobTitles.fullStackDeveloper',
  'Junior Frontend Developer': 'jobTitles.juniorFrontendDeveloper',
  'E-commerce Manager': 'jobTitles.ecommerceManager',
  'Digital Marketing Specialist': 'jobTitles.digitalMarketingSpecialist',
  'HR Generalist': 'jobTitles.hrGeneralist',
  'Logistics Coordinator': 'jobTitles.logisticsCoordinator',
  'Instructional Designer': 'jobTitles.instructionalDesigner',
  'Compliance Specialist': 'jobTitles.complianceSpecialist',
};

export function mapJobPayloadToFormValues(
  payload?: Partial<CreateJobPayload>
): CreateJobFormValues {
  return {
    title: payload?.title ?? '',
    description: payload?.description ?? '',
    company: payload?.company ?? '',
    companyId: payload?.companyId,
    direction: payload?.direction ?? Direction.IT,
    level: payload?.level ?? Level.Junior,
    workFormat: payload?.workFormat ?? JobWorkFormat.Office,
    location: payload?.location ?? '',
    requirementsInput: payload?.requirements
      ? formatListInput(payload.requirements)
      : '',
    responsibilitiesInput: payload?.responsibilities
      ? formatListInput(payload.responsibilities)
      : '',
    salaryMin: payload?.salary?.min?.toString() ?? '',
    salaryMax: payload?.salary?.max?.toString() ?? '',
    currency: payload?.salary?.currency ?? DEFAULT_CURRENCY,
    isActive: payload?.isActive ?? true,
  };
}

export function formatSalary(
  salary: JobSalary,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const { min, max, currency } = salary;
  const hasMin = min !== undefined;
  const hasMax = max !== undefined;

  // Если есть только одно значение или они равны - без тире
  if (!hasMin || !hasMax || min === max) {
    const value = hasMin ? min : max;
    return t('salarySingle', { value, currency });
  }

  // Если есть оба значения и они разные - через тире
  return t('salaryRange', { min, max, currency });
}

export function formatJobTitle(
  title: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const translationKey = JOB_TITLE_TRANSLATION_KEYS[title];
  return translationKey ? t(translationKey) : title;
}
