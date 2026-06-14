import express, { Router } from 'express';
import * as controller from '../controllers/adminAiRiskIndexController';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  adminAiRiskIndexIdParamsSchema,
  createAdminAiRiskIndexSchema,
  updateAdminAiRiskIndexSchema,
} from '../schemas';
import { UserRole } from '../types';

const router: Router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ADMIN]));

router.get('/', controller.listAiRiskIndexes);
router.get(
  '/:id',
  validateRequest(adminAiRiskIndexIdParamsSchema),
  controller.getAiRiskIndexById
);
router.post(
  '/',
  validateRequest(createAdminAiRiskIndexSchema),
  controller.createAiRiskIndex
);
router.put(
  '/:id',
  validateRequest(updateAdminAiRiskIndexSchema),
  controller.updateAiRiskIndex
);
router.delete(
  '/:id',
  validateRequest(adminAiRiskIndexIdParamsSchema),
  controller.deleteAiRiskIndex
);

export default router;
