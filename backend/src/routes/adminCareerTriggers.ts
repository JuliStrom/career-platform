import express, { Router } from 'express';
import * as controller from '../controllers/adminCareerTriggersController';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  adminCareerTriggerIdParamsSchema,
  createAdminCareerTriggerSchema,
  updateAdminCareerTriggerSchema,
} from '../schemas';
import { UserRole } from '../types';

const router: Router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ADMIN]));

router.get('/', controller.listCareerTriggers);
router.get(
  '/:id',
  validateRequest(adminCareerTriggerIdParamsSchema),
  controller.getCareerTriggerById
);
router.post(
  '/',
  validateRequest(createAdminCareerTriggerSchema),
  controller.createCareerTrigger
);
router.put(
  '/:id',
  validateRequest(updateAdminCareerTriggerSchema),
  controller.updateCareerTrigger
);
router.delete(
  '/:id',
  validateRequest(adminCareerTriggerIdParamsSchema),
  controller.deleteCareerTrigger
);

export default router;
