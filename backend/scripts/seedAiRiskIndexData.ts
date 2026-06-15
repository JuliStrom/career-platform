/**
 * Данные справочника AI Sustainability Index (Блок 4 ТЗ).
 * Используется в scripts/seed.ts (bulkWrite upsert по direction+level).
 */
import { Direction, Level } from '../src/types/profileEnums';
import { AiRiskLevel } from '../src/types/aiRiskIndex';

export type AiRiskSeedRow = {
  direction: Direction;
  level: Level;
  riskLevel: AiRiskLevel;
  riskScore: number;
  riskDescription: string;
  protectiveSkills: string[];
};

const key = (d: Direction, l: Level) => `${d}|${l}`;

/** Точные примеры из ТЗ + полное покрытие всех пар direction × level */
const OVERRIDES: Record<string, Omit<AiRiskSeedRow, 'direction' | 'level'>> = {
  [key(Direction.IT, Level.SENIOR)]: {
    riskLevel: AiRiskLevel.LOW,
    riskScore: 20,
    riskDescription:
      'Низкий риск (20). Senior+ IT-специалисты меньше всего затронуты массовой автоматизацией рутины; высокая ценность в интеграции AI, системной архитектуре и ответственности за продукт.',
    protectiveSkills: ['Интеграция AI', 'System Design', 'Лидерство команд', 'Безопасность и надёжность'],
  },
  [key(Direction.DESIGN, Level.JUNIOR)]: {
    riskLevel: AiRiskLevel.MEDIUM,
    riskScore: 55,
    riskDescription:
      'Средний риск (55). Базовые шаблонные задачи дизайна всё чаще закрываются генеративными инструментами; важно уходить в исследование, стратегию и смысл бренда.',
    protectiveSkills: ['UX Research', 'Стратегия продукта', 'Брендинг', 'Фасилитация и презентации'],
  },
  [key(Direction.ECOMMERCE, Level.MIDDLE)]: {
    riskLevel: AiRiskLevel.MEDIUM,
    riskScore: 60,
    riskDescription:
      'Средний риск (60). Операционка и отчёты автоматизируются; конкурентное преимущество — в аналитике, экспериментах и управлении эффективностью воронки.',
    protectiveSkills: ['Аналитика и метрики', 'CRO', 'Performance-маркетинг', 'Управление каталогом и юнит-экономикой'],
  },
  [key(Direction.HORECA, Level.JUNIOR)]: {
    riskLevel: AiRiskLevel.HIGH,
    riskScore: 75,
    riskDescription:
      'Высокий риск (75). Младшие операционные роли сильнее подвержены автоматизации процессов и стандартизации; рост — через управление, события и концепции.',
    protectiveSkills: ['Управление операциями', 'Ивент-продакшн', 'Разработка концепций', 'Гостеприимство премиум-сегмента'],
  },
};

function riskLevelFromScore(score: number): AiRiskLevel {
  if (score <= 35) return AiRiskLevel.LOW;
  if (score <= 65) return AiRiskLevel.MEDIUM;
  return AiRiskLevel.HIGH;
}

function defaultSkills(direction: Direction): string[] {
  const common = ['Коммуникация и переговоры', 'Критическое мышление', 'Работа с данными'];
  switch (direction) {
    case Direction.IT:
      return ['Архитектура систем', 'Код-ревью и менторинг', 'DevOps и наблюдаемость', ...common.slice(0, 2)];
    case Direction.DESIGN:
    case Direction.CREATIVE:
    case Direction.ARCHITECTURE_DESIGN:
      return ['Исследования пользователей', 'Дизайн-системы', 'Стейкхолдер-менеджмент', ...common.slice(0, 2)];
    case Direction.ECOMMERCE:
      return ['Аналитика спроса', 'Юнит-экономика', 'Кросс-функциональные запуски', ...common.slice(0, 2)];
    case Direction.HORECA:
      return ['Управление командой', 'Стандарты сервиса', 'Финансы точки', ...common.slice(0, 2)];
    case Direction.PRODUCTION:
      return ['Оптимизация процессов', 'Качество и бережливое производство', 'Работа с поставщиками', ...common.slice(0, 2)];
    case Direction.MARKETING:
      return [
        'Performance и аналитика',
        'Контент-стратегия и бренд-коммуникации',
        'SEO/ASO и органический рост',
        'Эксперименты и CRO-мышление',
      ];
    case Direction.SALES:
      return [
        'Сложные B2B/B2C переговоры',
        'Управление воронкой и прогнозом',
        'Account management',
        'Продуктовая экспертиза в продажах',
      ];
    case Direction.FINANCE:
      return ['FP&A и бюджетирование', 'Контроль и compliance', 'Риск-менеджмент', 'BI и финансовое моделирование'];
    case Direction.HR:
      return [
        'HR analytics и метрики',
        'L&D и развитие команд',
        'Трудовое право (практика)',
        'Employer brand и найм',
      ];
    case Direction.OPERATIONS:
      return [
        'Процессный подход и SLA',
        'Закупки и снабжение',
        'KPI и операционная эффективность',
        'Управление цепочками поставок',
      ];
    case Direction.EDUCATION:
      return [
        'Дизайн обучения (instructional design)',
        'EdTech и гибридные форматы',
        'Оценка результатов обучения',
        'Фасилитация и вовлечение',
      ];
    case Direction.LEGAL:
      return [
        'Договорная работа и сделки',
        'Отраслевая регуляторика',
        'Риск-анализ и compliance',
        'Переговоры и mediation',
      ];
    default:
      return ['Стратегическое планирование', 'Лидерство', 'Непрерывное обучение', ...common.slice(0, 2)];
  }
}

function baseScore(direction: Direction, level: Level): number {
  let s = 50;
  switch (level) {
    case Level.JUNIOR:
      s = 64;
      break;
    case Level.MIDDLE:
      s = 54;
      break;
    case Level.SENIOR:
      s = 42;
      break;
    case Level.LEAD:
      s = 30;
      break;
    default:
      break;
  }
  if (direction === Direction.IT) s -= 8;
  if (direction === Direction.DESIGN || direction === Direction.CREATIVE) s += 5;
  if (direction === Direction.HORECA && level === Level.JUNIOR) s += 6;
  if (direction === Direction.ECOMMERCE && level === Level.MIDDLE) s += 4;
  if (direction === Direction.MARKETING) s += 4;
  if (direction === Direction.SALES) s += 2;
  if (direction === Direction.FINANCE) s -= 2;
  if (direction === Direction.HR) s += 3;
  if (direction === Direction.OPERATIONS) s += 5;
  if (direction === Direction.EDUCATION) s += 2;
  if (direction === Direction.LEGAL) s -= 4;
  return Math.min(92, Math.max(18, Math.round(s)));
}

function defaultDescription(direction: Direction, level: Level, score: number, rl: AiRiskLevel): string {
  const rlRu =
    rl === AiRiskLevel.LOW ? 'низкий' : rl === AiRiskLevel.MEDIUM ? 'средний' : 'высокий';
  return `${rlRu.charAt(0).toUpperCase() + rlRu.slice(1)} риск автоматизации (${score}/100) для направления «${direction}», уровень «${level}». Оценка ориентировочная на горизонт 3–5 лет; усильте позицию за счёт навыков ниже.`;
}

export function buildAiRiskIndexSeedRows(): AiRiskSeedRow[] {
  const rows: AiRiskSeedRow[] = [];
  for (const direction of Object.values(Direction)) {
    for (const level of Object.values(Level)) {
      const k = key(direction, level);
      const override = OVERRIDES[k];
      if (override) {
        rows.push({ direction, level, ...override });
        continue;
      }
      const riskScore = baseScore(direction, level);
      const riskLevel = riskLevelFromScore(riskScore);
      rows.push({
        direction,
        level,
        riskLevel,
        riskScore,
        riskDescription: defaultDescription(direction, level, riskScore, riskLevel),
        protectiveSkills: defaultSkills(direction),
      });
    }
  }
  return rows;
}
