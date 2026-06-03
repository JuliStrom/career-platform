import { Request, Response } from 'express';
import LearningResource from '../models/LearningResource';
import Profile from '../models/Profile';
import { getErrorMessage } from '../utils/errorHandlers';
import {AuthRequest} from "../types";

type LearningQuery = {
    direction?: string;
    level?: string;
    type?: string;
    location?: string;
    price?: string;
};

function buildLearningFilter(query: LearningQuery) {
    const filter: {
        isActive: boolean;
        direction?: string;
        level?: string;
        type?: string;
        locationType?: string;
        price?: { $lte: number };
    } = {
        isActive: true,
    };

    if (query.direction?.trim()) {
        filter.direction = query.direction.trim();
    }

    if (query.level?.trim()) {
        filter.level = query.level.trim();
    }

    if (query.type?.trim()) {
        filter.type = query.type.trim();
    }

    if (query.location?.trim()) {
        filter.locationType = query.location.trim();
    }

    if (query.price?.trim()) {
        const maxPrice = Number(query.price);

        if (!Number.isNaN(maxPrice) && maxPrice >= 0) {
            filter.price = { $lte: maxPrice };
        }
    }

    return filter;
}

/**
 * GET /api/learning?direction=&level=&type=&location=&price=
 */
export const getLearning = async (
    req: Request<{}, {}, {}, LearningQuery>,
    res: Response
): Promise<void> => {
    try {
        const filter = buildLearningFilter(req.query);

        const resources = await LearningResource.find(filter)
            .sort({ isFeatured: -1, sortOrder: 1, title: 1 })
            .select('-__v');

        res.status(200).json({
            filters: req.query,
            count: resources.length,
            resources,
        });
    } catch (error: unknown) {
        res.status(500).json({ error: getErrorMessage(error) });
    }
};

/**
 * GET /api/learning/recommended
 */
export const getRecommendedLearning = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Необходима авторизация' });
            return;
        }

        const profile = await Profile.findOne({ userId });

        if (!profile) {
            res.status(400).json({
                error: 'Профиль не найден. Создайте профиль для получения рекомендаций',
            });
            return;
        }

        const resources = await LearningResource.find({
            isActive: true,
            direction: profile.direction,
            level: profile.level,
        })
            .sort({ isFeatured: -1, sortOrder: 1, title: 1 })
            .select('-__v');

        res.status(200).json({
            profile: {
                direction: profile.direction,
                level: profile.level,
                careerGoal: profile.careerGoal,
            },
            count: resources.length,
            resources,
        });
    } catch (error: unknown) {
        res.status(500).json({ error: getErrorMessage(error) });
    }
};
