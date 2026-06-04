import express, { Router } from 'express';
import * as careerController from '../controllers/careerController';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { UserRole } from '../types';
import {
  createCareerScenarioSchema,
  updateCareerScenarioSchema,
  scenarioIdParamsSchema,
  createCareerRoadmapSchema,
  updateCareerRoadmapSchema,
  roadmapIdParamsSchema,
  createLearningResourceSchema,
  updateLearningResourceSchema,
  learningResourceIdParamsSchema,
  createCareerRouteSchema,
  updateCareerRouteSchema,
  careerRouteIdParamsSchema,
} from '../schemas';

const router: Router = express.Router();

// Все роуты защищены authMiddleware
router.use(authMiddleware);

// Карта развития (профиль → roadmaps + learningResources по тегам навыков)
router.get('/roadmap', careerController.getCareerRoadmap);

// Карьерный триггер «Пора расти» (карточка по грейду/стажу или спец-условиям)
router.get('/trigger', careerController.getCareerTrigger);

// AI Sustainability Index (справочник по direction + level из профиля)
router.get('/ai-risk', careerController.getAiRisk);

// Блок 5 — хаб «Меняю профессию» (при careerChangeTrackActive в профиле)
router.get('/career-change-hub', careerController.getCareerChangeHub);

// Получение персональных рекомендаций (для всех авторизованных пользователей)
router.get('/recommendations', careerController.getRecommendations);

// Получение одной рекомендации по ID (для просмотра)
router.get(
  '/recommendations/:id',
  validateRequest(scenarioIdParamsSchema),
  careerController.getRecommendationById
);

// CRUD для карьерных сценариев (только для ADMIN)
router.post(
  '/scenarios',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(createCareerScenarioSchema),
  careerController.createScenario
);

router.get(
  '/scenarios',
  roleMiddleware([UserRole.ADMIN]),
  careerController.getScenarios
);

router.get(
  '/scenarios/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(scenarioIdParamsSchema),
  careerController.getScenarioById
);

router.put(
  '/scenarios/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(updateCareerScenarioSchema),
  careerController.updateScenario
);

router.delete(
  '/scenarios/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(scenarioIdParamsSchema),
  careerController.deleteScenario
);

// [ADMIN] Карты развития career_roadmaps
router.post(
  '/roadmaps',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(createCareerRoadmapSchema),
  careerController.createRoadmap
);

router.get('/roadmaps', roleMiddleware([UserRole.ADMIN]), careerController.getRoadmaps);

router.get(
  '/roadmaps/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(roadmapIdParamsSchema),
  careerController.getRoadmapById
);

router.put(
  '/roadmaps/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(updateCareerRoadmapSchema),
  careerController.updateRoadmap
);

router.delete(
  '/roadmaps/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(roadmapIdParamsSchema),
  careerController.deleteRoadmap
);

// [ADMIN] Обучающие ресурсы (связь с картами через tags = skillsToDevelop)
router.post(
  '/learning-resources',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(createLearningResourceSchema),
  careerController.createLearningResource
);

router.get(
  '/learning-resources',
  roleMiddleware([UserRole.ADMIN]),
  careerController.getLearningResources
);

router.get(
  '/learning-resources/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(learningResourceIdParamsSchema),
  careerController.getLearningResourceById
);

router.put(
  '/learning-resources/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(updateLearningResourceSchema),
  careerController.updateLearningResource
);

router.delete(
  '/learning-resources/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(learningResourceIdParamsSchema),
  careerController.deleteLearningResource
);

// [ADMIN] Зарубежные карьерные маршруты career_routes
router.post(
  '/career-routes',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(createCareerRouteSchema),
  careerController.createCareerRoute
);

router.get(
  '/career-routes',
  roleMiddleware([UserRole.ADMIN]),
  careerController.getCareerRoutes
);

router.get(
  '/career-routes/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(careerRouteIdParamsSchema),
  careerController.getCareerRouteById
);

router.put(
  '/career-routes/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(updateCareerRouteSchema),
  careerController.updateCareerRoute
);

router.delete(
  '/career-routes/:id',
  roleMiddleware([UserRole.ADMIN]),
  validateRequest(careerRouteIdParamsSchema),
  careerController.deleteCareerRoute
);

export default router;
