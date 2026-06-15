import {Response} from 'express';
import mongoose from 'mongoose';
import {
    AuthRequest,
    CAREER_CHANGE_RESOURCE_TAGS,
    Direction,
    IAiRiskIndex,
    Level,
    NotificationType,
    RoadmapBranchType
} from '../types';
import CareerScenario from '../models/CareerScenario';
import CareerRoadmap from '../models/CareerRoadmap';
import CareerRoute from '../models/CareerRoute';
import LearningResource from '../models/LearningResource';
import Profile from '../models/Profile';
import AiRiskIndex from '../models/AiRiskIndex';
import {getErrorMessage} from '../utils/errorHandlers';
import {computeYearsInCurrentRole} from '../utils/profileYears';
import {resolveCareerTrigger} from '../services/careerTriggerResolve';
import {toCareerTriggerCardDto} from '../services/careerTriggerDto';
import {loadActiveLearningResourcesLean} from '../services/matchLearningResourcesForRoadmap';
import {buildCareerRoadmapDtos} from '../services/careerRoadmapDto';
import {createNotification} from "../services/notificationDto";

type AiRiskIndexLean = IAiRiskIndex & {
    _id: mongoose.Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
};

/**
 * GET /api/career/roadmap
 *
 * FRONTEND:
 * - Подбор карт по текущему профилю: profileContext.direction + profileContext.fromLevel (грейд из профиля).
 * - roadmaps — массив вариантов (например, разные branchType: technical / management / entrepreneurship).
 *   Если пусто — для этой пары направление+грейд карт в БД нет.
 * - У каждой карты: skillsToDevelop — навыки «точки А→Б»; learningResources подобраны по пересечению тегов
 *   ресурсов с этими навыками (normalize: trim, lower case, один пробел между словами).
 * - matchedSkills у ресурса — какие строки из skillsToDevelop совпали; показывайте связку навык→материал.
 * - estimatedTimeMonths + estimatedTimeMonthsMax: если max null — отображайте одно число месяцев; иначе диапазон.
 * - branchType и careerBranches: ветвление после целевой роли (careerBranches может быть []).
 */
export const getCareerRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({error: 'Необходима авторизация'});
            return;
        }

        const profile = await Profile.findOne({userId});
        if (!profile) {
            res.status(400).json({
                error: 'Профиль не найден. Создайте профиль, чтобы видеть карту развития',
            });
            return;
        }

        const roadmaps = await CareerRoadmap.find({
            direction: profile.direction,
            fromLevel: profile.level,
            isActive: true,
        }).sort({sortOrder: 1, createdAt: 1});

        const resourcePool = await loadActiveLearningResourcesLean();
        const roadmapsDto = buildCareerRoadmapDtos(roadmaps, resourcePool);

        res.status(200).json({
            profileContext: {
                direction: profile.direction,
                fromLevel: profile.level,
            },
            roadmaps: roadmapsDto,
        });
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

/**
 * GET /api/career/trigger
 *
 * FRONTEND:
 * - При успехе: 200 и поля yearsInCurrentRole, trigger.
 * - Если trigger === null — карточку «Пора расти» не показывать (нет подходящего правила:
 *   нет даты careerStartDate для грейдовых триггеров, грейд Lead, или стаж ниже порогов).
 * - Если trigger !== null — используйте triggerTitle, triggerDescription, nextSteps (3 пункта),
 *   ctaButtons (3 кнопки), primaryCta — какой CTA подсветить в первую очередь.
 */
export const getCareerTrigger = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({error: 'Необходима авторизация'});
            return;
        }

        const profile = await Profile.findOne({userId});
        if (!profile) {
            res.status(400).json({
                error: 'Профиль не найден. Создайте профиль, чтобы получать карьерные триггеры',
            });
            return;
        }

        const yearsInCurrentRole = computeYearsInCurrentRole(profile.careerStartDate);
        const resolved = await resolveCareerTrigger(profile, yearsInCurrentRole);
// карьерный триггер для создания уведомления
        if (resolved) {
            await createNotification({
                userId: profile.userId,
                type: NotificationType.GROWTH_TRIGGER,
                payload: {
                    years: yearsInCurrentRole,
                    level: profile.level,
                    route: '/recommendations',
                },
                deduplicationKey: `growth:${profile.userId}:${profile.level}:${yearsInCurrentRole}`,
            })
        }
        res.status(200).json({
            yearsInCurrentRole,
            trigger: resolved ? toCareerTriggerCardDto(resolved.doc, resolved.matchReason) : null,
        });
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

/**
 * GET /api/career/ai-risk
 *
 * Карточка «AI-индекс устойчивости профессии» по текущему профилю (direction + level).
 * Данные из справочника ai_risk_index (заполняется seed).
 */
export const getAiRisk = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({error: 'Необходима авторизация'});
            return;
        }

        const profile = await Profile.findOne({userId});
        if (!profile) {
            res.status(400).json({
                error: 'Профиль не найден. Создайте профиль, чтобы увидеть AI-индекс устойчивости',
            });
            return;
        }

        const row = await AiRiskIndex.findOne({
            direction: profile.direction,
            level: profile.level,
        }).lean<AiRiskIndexLean>();

        if (!row) {
            res.status(404).json({
                error:
                    'Запись индекса не найдена. Выполните заполнение справочника: npm run seed (или npx ts-node scripts/seed.ts) из папки backend.',
            });
            return;
        }

        res.status(200).json({
            profile: {
                direction: profile.direction,
                level: profile.level,
            },
            id: String(row._id),
            riskLevel: row.riskLevel,
            riskScore: row.riskScore,
            riskDescription: row.riskDescription,
            protectiveSkills: row.protectiveSkills,
            updatedAt: row.updatedAt,
        });
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

/**
 * GET /api/career/career-change-hub
 *
 * Блок 5 ТЗ — контент для трека «Меняю профессию»: курсы с нуля, стажировки, госпрограммы, истории.
 * Доступно только если в профиле careerChangeTrackActive === true.
 */
export const getCareerChangeHub = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({error: 'Необходима авторизация'});
            return;
        }

        const profile = await Profile.findOne({userId}).lean();
        if (!profile) {
            res.status(400).json({error: 'Профиль не найден'});
            return;
        }
        if (!profile.careerChangeTrackActive) {
            res.status(403).json({
                error:
                    'Раздел доступен после включения трека «Меняю профессию» в настройках профиля.',
            });
            return;
        }

        const T = CAREER_CHANGE_RESOURCE_TAGS;
        const docs = await LearningResource.find({
            isActive: true,
            tags: T.HUB,
        })
            .sort({sortOrder: 1, title: 1})
            .lean();

        const norm = (s: string) => s.trim().toLowerCase();
        const hasTag = (tags: string[], key: string) =>
            tags.some((t) => norm(t) === norm(key));

        const toDto = (d: {
            _id: unknown;
            title: string;
            description?: string | null;
            url?: string | null;
            tags: string[];
        }) => ({
            id: String(d._id),
            title: d.title,
            description: d.description ?? null,
            url: d.url ?? null,
            tags: d.tags,
        });

        const learningFromScratch = docs
            .filter((d) => hasTag(d.tags, T.FROM_SCRATCH))
            .map(toDto);
        const internshipsKz = docs.filter((d) => hasTag(d.tags, T.INTERNSHIP_KZ)).map(toDto);
        const internshipsAbroad = docs
            .filter((d) => hasTag(d.tags, T.INTERNSHIP_ABROAD))
            .map(toDto);
        const learningGeneral = docs
            .filter(
                (d) =>
                    !hasTag(d.tags, T.FROM_SCRATCH) &&
                    !hasTag(d.tags, T.INTERNSHIP_KZ) &&
                    !hasTag(d.tags, T.INTERNSHIP_ABROAD) &&
                    !hasTag(d.tags, T.SUCCESS_STORY)
            )
            .map(toDto);
        const successStoryResources = docs
            .filter((d) => hasTag(d.tags, T.SUCCESS_STORY))
            .map(toDto);

        const governmentPrograms = [
            {
                id: 'mintrud_gov_kz',
                title: 'Министерство труда и социальной защиты РК',
                description:
                    'Государственная политика занятости и социальной защиты; разделы о поддержке занятости и переподготовке.',
                url: 'https://www.gov.kz/memleket/entities/miten?lang=ru',
                region: 'kz' as const,
            },
            {
                id: 'enbek_kz',
                title: 'Портал Enbek',
                description: 'Государственные сервисы занятости, обучение и вакансии в Казахстане.',
                url: 'https://www.enbek.kz/',
                region: 'kz' as const,
            },
            {
                id: 'bolashak',
                title: 'Программа «Болашак»',
                description: 'Обучение за рубежом для формирования кадрового резерва.',
                url: 'https://bolashak.gov.kz/',
                region: 'kz' as const,
            },
        ];

        const successStories = [
            {
                id: 'story_template_1',
                title: 'Из операционного менеджмента в продуктовую аналитику в 42 года',
                summary:
                    'Базовые курсы по SQL и метрикам, менторство и проект в портфолио — через год первый оффер в продуктовой команде.',
                ageRange: '40–50',
            },
            {
                id: 'story_template_2',
                title: 'Сервис → UX после перерыва',
                summary:
                    'Короткая программа по UX, волонтёрство на некоммерческом проекте и стажировка как шаг к первому контракту.',
                ageRange: '35–45',
            },
        ];

        res.status(200).json({
            tone: 'supportive',
            intro: {
                title: 'Вы не одни на этом пути',
                body:
                    'Смена профессии после 35 — обычная история. Здесь собраны материалы «с нуля», стажировки и официальные программы; двигайтесь в комфортном темпе и опирайтесь на поддержку.',
            },
            track: {
                currentField: profile.careerChangeCurrentField ?? null,
                targetDirection: profile.careerChangeTargetDirection ?? null,
                ageRange: profile.careerChangeAgeRange ?? null,
                motivation: profile.careerChangeMotivation ?? null,
                timeline: profile.careerChangeTimeline ?? null,
            },
            governmentPrograms,
            learningFromScratch,
            learningGeneral,
            internshipsKz,
            internshipsAbroad,
            successStories,
            successStoryResources,
        });
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// Получение персональных карьерных рекомендаций для пользователя
export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({error: 'Необходима авторизация'});
            return;
        }

        // Получаем профиль пользователя
        const profile = await Profile.findOne({userId});
        if (!profile) {
            res.status(400).json({error: 'Профиль пользователя не найден. Создайте профиль для получения рекомендаций'});
            return;
        }

        // Ищем подходящие сценарии по direction и level
        const scenarios = await CareerScenario.find({
            direction: profile.direction,
            level: profile.level,
            isActive: true,
        }).select('-createdBy -__v');

        if (scenarios.length === 0) {
            res.status(404).json({error: 'Рекомендации не найдены для вашего профиля'});
            return;
        }

        res.status(200).json({
            profile: {
                direction: profile.direction,
                level: profile.level,
                careerGoal: profile.careerGoal,
                careerStartDate: profile.careerStartDate ?? null,
                yearsInCurrentRole: computeYearsInCurrentRole(profile.careerStartDate),
            },
            recommendations: scenarios,
        });
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// Получение одного сценария по ID (для просмотра, только если подходит по профилю)
export const getRecommendationById = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({error: 'Необходима авторизация'});
            return;
        }

        const profile = await Profile.findOne({userId});
        if (!profile) {
            res.status(400).json({error: 'Профиль пользователя не найден'});
            return;
        }

        const scenario = await CareerScenario.findOne({
            _id: req.params.id,
            direction: profile.direction,
            level: profile.level,
            isActive: true,
        }).select('-createdBy -__v');

        if (!scenario) {
            res.status(404).json({error: 'Рекомендация не найдена'});
            return;
        }

        res.status(200).json(scenario);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// [ADMIN] Создание нового карьерного сценария
export const createScenario = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const {
            direction,
            level,
            title,
            description,
            actions,
            careerBranches,
            transitionSkills,
            sortOrder,
            isActive,
        }: any = req.body;

        const scenario = await CareerScenario.create({
            direction,
            level,
            title,
            description,
            actions,
            careerBranches: careerBranches ?? [],
            transitionSkills: transitionSkills ?? [],
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
            createdBy: userId,
        });

        res.status(201).json(scenario);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// [ADMIN] Получение всех карьерных сценариев
export const getScenarios = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {direction, level, isActive} = req.query;

        const filter: any = {};
        if (direction) filter.direction = direction;
        if (level) filter.level = level;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const scenarios = await CareerScenario.find(filter)
            .populate('createdBy', 'email role')
            .sort({sortOrder: 1, createdAt: -1});

        res.status(200).json(scenarios);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// [ADMIN] Получение карьерного сценария по ID
export const getScenarioById = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;

        const scenario = await CareerScenario.findById(id).populate('createdBy', 'email role');

        if (!scenario) {
            res.status(404).json({error: 'Карьерный сценарий не найден'});
            return;
        }

        res.status(200).json(scenario);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// [ADMIN] Обновление карьерного сценария
export const updateScenario = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const updateData = req.body;

        const scenario = await CareerScenario.findByIdAndUpdate(
            id,
            updateData,
            {new: true, runValidators: true}
        );

        if (!scenario) {
            res.status(404).json({error: 'Карьерный сценарий не найден'});
            return;
        }

        res.status(200).json(scenario);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// [ADMIN] Удаление карьерного сценария
export const deleteScenario = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;

        const scenario = await CareerScenario.findByIdAndDelete(id);

        if (!scenario) {
            res.status(404).json({error: 'Карьерный сценарий не найден'});
            return;
        }

        res.status(200).json({message: 'Карьерный сценарий успешно удален'});
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// --- [ADMIN] Карты развития (career_roadmaps) — для панели без ML ---

export const createRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            direction,
            fromLevel,
            toLevel,
            toRole,
            skillsToDevelop,
            estimatedTimeMonths,
            estimatedTimeMonthsMax,
            branchType,
            careerBranches,
            sortOrder,
            isActive,
        } = req.body as {
            direction: Direction;
            fromLevel: Level;
            toLevel: Level;
            toRole: string;
            skillsToDevelop: string[];
            estimatedTimeMonths: number;
            estimatedTimeMonthsMax?: number | null;
            branchType: RoadmapBranchType;
            careerBranches?: string[];
            sortOrder?: number;
            isActive?: boolean;
        };

        const roadmap = await CareerRoadmap.create({
            direction,
            fromLevel,
            toLevel,
            toRole,
            skillsToDevelop,
            estimatedTimeMonths,
            estimatedTimeMonthsMax: estimatedTimeMonthsMax ?? null,
            branchType,
            careerBranches: careerBranches ?? [],
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
        });

        res.status(201).json(roadmap);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const getRoadmaps = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {direction, fromLevel, isActive, branchType} = req.query;

        const filter: {
            direction?: Direction;
            fromLevel?: Level;
            branchType?: RoadmapBranchType;
            isActive?: boolean;
        } = {};
        if (typeof direction === 'string' && direction) filter.direction = direction as Direction;
        if (typeof fromLevel === 'string' && fromLevel) filter.fromLevel = fromLevel as Level;
        if (typeof branchType === 'string' && branchType) filter.branchType = branchType as RoadmapBranchType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const list = await CareerRoadmap.find(filter).sort({sortOrder: 1, createdAt: -1});
        res.status(200).json(list);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const getRoadmapById = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const roadmap = await CareerRoadmap.findById(id);
        if (!roadmap) {
            res.status(404).json({error: 'Карта развития не найдена'});
            return;
        }
        res.status(200).json(roadmap);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const updateRoadmap = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const roadmap = await CareerRoadmap.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!roadmap) {
            res.status(404).json({error: 'Карта развития не найдена'});
            return;
        }
        res.status(200).json(roadmap);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const deleteRoadmap = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const roadmap = await CareerRoadmap.findByIdAndDelete(id);
        if (!roadmap) {
            res.status(404).json({error: 'Карта развития не найдена'});
            return;
        }
        res.status(200).json({message: 'Карта развития удалена'});
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

// --- [ADMIN] Обучающие ресурсы (learning_resources), связь с картами через tags ↔ skillsToDevelop ---

export const createLearningResource = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            title,
            provider,
            type,
            direction,
            level,
            description,
            url,
            isInternational,
            durationWeeks,
            price,
            locationType,
            city,
            country,
            targetCountry,
            tags,
            skillsTags,
            isFeatured,
            isReskilling,
            isAdminEducationCard,
            sortOrder,
            isActive,
        } = req.body as {
            title: string;
            provider?: string | null;
            type?: string | null;
            direction?: string | null;
            level?: string | null;
            description?: string | null;
            url?: string | null;
            isInternational?: boolean;
            durationWeeks?: number | null;
            price?: number;
            locationType?: 'online' | 'offline' | 'hybrid';
            city?: string | null;
            country?: string | null;
            targetCountry?: string | null;
            tags?: string[];
            skillsTags?: unknown;
            isFeatured?: boolean;
            isReskilling?: boolean;
            isAdminEducationCard?: boolean;
            sortOrder?: number;
            isActive?: boolean;
        };
        const fallbackTags = Array.isArray(skillsTags)
            ? skillsTags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
            : [];

        const doc = await LearningResource.create({
            title,
            provider: provider ?? null,
            type: type ?? null,
            direction: direction ?? null,
            level: level ?? null,
            description: description ?? null,
            url: url || null,
            isInternational: isInternational ?? false,
            durationWeeks: durationWeeks ?? null,
            price: price ?? 0,
            locationType: locationType ?? 'online',
            city: city ?? null,
            country: country ?? null,
            targetCountry: targetCountry ?? null,
            tags: tags ?? fallbackTags,
            skillsTags: skillsTags ?? [],
            isFeatured: isFeatured ?? false,
            isReskilling: isReskilling ?? false,
            isAdminEducationCard: isAdminEducationCard ?? true,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
        });

        //триггер для генерации нового уведомления
        if (doc.isActive) {
            const profileFilter: Record<string, unknown> = {};
            if (doc.direction) profileFilter.direction = doc.direction;
            if (doc.level) profileFilter.level = doc.level;

            const profiles = await Profile.find(profileFilter).select('userId');
            await Promise.all(
                profiles.map((profile) => {
                    createNotification({
                        userId: profile.userId,
                        type: NotificationType.NEW_COURSES,
                        payload: {
                            courseIds: [doc._id.toString()],
                            route: '/education',
                        },
                        deduplicationKey: `new-course:${doc._id}:${profile.userId}`,
                    })
                })
            );
        }

        res.status(201).json(doc);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const getLearningResources = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            isActive,
            tag,
            isInternational,
            targetCountry,
            direction,
            level,
            provider,
            type,
            locationType,
            city,
            country,
            isFeatured,
            isReskilling,
            isAdminEducationCard,
        } = req.query;
        const filter: Record<string, unknown> = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isInternational !== undefined) filter.isInternational = isInternational === 'true';
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
        if (isReskilling !== undefined) filter.isReskilling = isReskilling === 'true';
        if (isAdminEducationCard !== undefined) {
            filter.$or =
                isAdminEducationCard === 'true'
                    ? [
                        {isAdminEducationCard: true},
                        {
                            isAdminEducationCard: {$ne: true},
                            provider: {$nin: [null, '']},
                            type: {$nin: [null, '']},
                            direction: {$nin: [null, '']},
                        },
                    ]
                    : [{isAdminEducationCard: false}, {isAdminEducationCard: {$exists: false}}];
        }
        if (typeof targetCountry === 'string' && targetCountry.trim()) {
            filter.targetCountry = targetCountry.trim();
        }
        if (typeof direction === 'string' && direction.trim()) filter.direction = direction.trim();
        if (typeof level === 'string' && level.trim()) filter.level = level.trim();
        if (typeof provider === 'string' && provider.trim()) filter.provider = provider.trim();
        if (typeof type === 'string' && type.trim()) filter.type = type.trim();
        if (typeof locationType === 'string' && locationType.trim()) filter.locationType = locationType.trim();
        if (typeof city === 'string' && city.trim()) filter.city = city.trim();
        if (typeof country === 'string' && country.trim()) filter.country = country.trim();
        if (typeof tag === 'string' && tag.trim()) {
            filter.tags = tag.trim();
        }

        const list = await LearningResource.find(filter).sort({sortOrder: 1, title: 1});
        res.status(200).json(list);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const getLearningResourceById = async (
    req: AuthRequest<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const doc = await LearningResource.findById(req.params.id);
        if (!doc) {
            res.status(404).json({error: 'Ресурс не найден'});
            return;
        }
        res.status(200).json(doc);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const updateLearningResource = async (
    req: AuthRequest<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const doc = await LearningResource.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            res.status(404).json({error: 'Ресурс не найден'});
            return;
        }
        res.status(200).json(doc);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const deleteLearningResource = async (
    req: AuthRequest<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const doc = await LearningResource.findByIdAndDelete(req.params.id);
        if (!doc) {
            res.status(404).json({error: 'Ресурс не найден'});
            return;
        }
        res.status(200).json({message: 'Ресурс удалён'});
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const createCareerRoute = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {direction, fromCity, toCountry, title, steps, resources, isFeatured} = req.body as {
            direction: Direction;
            fromCity?: string | null;
            toCountry: string;
            title: string;
            steps?: unknown;
            resources?: unknown;
            isFeatured?: boolean;
        };

        const route = await CareerRoute.create({
            direction,
            fromCity: fromCity ?? null,
            toCountry,
            title,
            steps: steps ?? [],
            resources: resources ?? [],
            isFeatured: isFeatured ?? false,
        });

        res.status(201).json(route);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const getCareerRoutes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {direction, fromCity, toCountry, isFeatured} = req.query;
        const filter: {
            direction?: Direction;
            fromCity?: string;
            toCountry?: string;
            isFeatured?: boolean;
        } = {};

        if (typeof direction === 'string' && direction) filter.direction = direction as Direction;
        if (typeof fromCity === 'string' && fromCity.trim()) filter.fromCity = fromCity.trim();
        if (typeof toCountry === 'string' && toCountry.trim()) filter.toCountry = toCountry.trim();
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

        const list = await CareerRoute.find(filter).sort({isFeatured: -1, createdAt: -1});
        res.status(200).json(list);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const getCareerRouteById = async (
    req: AuthRequest<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const route = await CareerRoute.findById(req.params.id);
        if (!route) {
            res.status(404).json({error: 'Маршрут не найден'});
            return;
        }
        res.status(200).json(route);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const updateCareerRoute = async (
    req: AuthRequest<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const route = await CareerRoute.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!route) {
            res.status(404).json({error: 'Маршрут не найден'});
            return;
        }
        res.status(200).json(route);
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};

export const deleteCareerRoute = async (
    req: AuthRequest<{ id: string }>,
    res: Response
): Promise<void> => {
    try {
        const route = await CareerRoute.findByIdAndDelete(req.params.id);
        if (!route) {
            res.status(404).json({error: 'Маршрут не найден'});
            return;
        }
        res.status(200).json({message: 'Маршрут удален'});
    } catch (error: unknown) {
        res.status(500).json({error: getErrorMessage(error)});
    }
};
