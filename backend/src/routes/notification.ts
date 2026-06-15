import express, { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
