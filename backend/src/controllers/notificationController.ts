import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import { getErrorMessage } from '../utils/errorHandlers';

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .select('-deduplicationKey -__v')
        .sort({ sentAt: -1 })
        .limit(20)
        .lean(),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    res.status(200).json({ notifications, unreadCount });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const markAsRead = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: 'Некорректный ID уведомления' });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    ).select('-deduplicationKey -__v');

    if (!notification) {
      res.status(404).json({ error: 'Уведомление не найдено' });
      return;
    }

    res.status(200).json({ notification });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ updatedCount: result.modifiedCount });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
