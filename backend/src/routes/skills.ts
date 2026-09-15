import express, { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { suggestSkillsSchema } from '../schemas/skills.schema';
import * as skillsController from '../controllers/skillsController';

const router: Router = express.Router();

router.use(authMiddleware);
router.get('/suggest', validateRequest(suggestSkillsSchema), skillsController.suggest);

export default router;
