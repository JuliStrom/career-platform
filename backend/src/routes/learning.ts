import express, {Router} from "express";
import authMiddleware from "../middleware/authMiddleware";
import * as learningController from '../controllers/learningController';

const router: Router = express.Router();

// Карта обучения
router.get('/', learningController.getLearning);
router.get('/recommended', authMiddleware, learningController.getRecommendedLearning);

export default router;
