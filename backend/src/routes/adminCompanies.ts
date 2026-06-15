import express, { Router } from 'express';
import * as adminCompaniesController from '../controllers/adminCompaniesController';
import authMiddleware from '../middleware/authMiddleware';
import roleMiddleware from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  adminCompanyIdParamsSchema,
  createAdminCompanySchema,
  updateAdminCompanySchema,
} from '../schemas';
import { UserRole } from '../types';

const router: Router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ADMIN]));

router.get('/', adminCompaniesController.listCompanies);
router.get(
  '/:id',
  validateRequest(adminCompanyIdParamsSchema),
  adminCompaniesController.getCompanyById
);
router.post(
  '/',
  validateRequest(createAdminCompanySchema),
  adminCompaniesController.createCompany
);
router.put(
  '/:id',
  validateRequest(updateAdminCompanySchema),
  adminCompaniesController.updateCompany
);
router.delete(
  '/:id',
  validateRequest(adminCompanyIdParamsSchema),
  adminCompaniesController.deleteCompany
);

export default router;
