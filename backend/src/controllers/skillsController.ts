import { Response } from 'express';
import { AuthRequest } from '../types';
import { suggestSkills } from '../services/skillDictionary';
import { getErrorMessage } from '../utils/errorHandlers';

export const suggest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const items = await suggestSkills(q);
    res.status(200).json({ items });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
