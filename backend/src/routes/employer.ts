import express, { Router } from "express";
import * as employerController from "../controllers/employerController";
import authMiddleware from "../middleware/authMiddleware";
import userTypeMiddleware from "../middleware/userTypeMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  contactSpecialistSchema,
  createEmployerCompanySchema,
  createEmployerJobSchema,
  createEmployerProfileSchema,
  employerJobIdParamsSchema,
  listSpecialistsSchema,
  updateEmployerCompanySchema,
  updateEmployerJobSchema,
  updateEmployerProfileSchema,
} from "../schemas";
import { UserType } from "../types";

const router: Router = express.Router();

router.use(authMiddleware);
router.use(userTypeMiddleware([UserType.EMPLOYER]));

router.get("/profile", employerController.getProfile);
router.post(
  "/profile",
  validateRequest(createEmployerProfileSchema),
  employerController.createProfile,
);
router.put(
  "/profile",
  validateRequest(updateEmployerProfileSchema),
  employerController.updateProfile,
);

router.get("/company", employerController.getCompany);
router.post(
  "/company",
  validateRequest(createEmployerCompanySchema),
  employerController.createCompany,
);
router.put(
  "/company",
  validateRequest(updateEmployerCompanySchema),
  employerController.updateCompany,
);

router.get("/jobs", employerController.listJobs);
router.post(
  "/jobs",
  validateRequest(createEmployerJobSchema),
  employerController.createJob,
);
router.get(
  "/jobs/:id",
  validateRequest(employerJobIdParamsSchema),
  employerController.getJob,
);
router.put(
  "/jobs/:id",
  validateRequest(updateEmployerJobSchema),
  employerController.updateJob,
);
router.delete(
  "/jobs/:id",
  validateRequest(employerJobIdParamsSchema),
  employerController.deleteJob,
);

router.get(
  "/specialists",
  validateRequest(listSpecialistsSchema),
  employerController.listSpecialists,
);
router.post(
  "/specialists/:profileId/contact",
  validateRequest(contactSpecialistSchema),
  employerController.contactSpecialist,
);

export default router;
