import { Response } from 'express';
import AiRiskIndex from '../models/AiRiskIndex';
import { AuthRequest, IAiRiskIndex } from '../types';
import { getErrorMessage } from '../utils/errorHandlers';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

export const listAiRiskIndexes = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await AiRiskIndex.find().sort({ direction: 1, level: 1 });
    res.status(200).json(items);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getAiRiskIndexById = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const item = await AiRiskIndex.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'AI risk index not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createAiRiskIndex = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await AiRiskIndex.create(req.body as IAiRiskIndex);
    res.status(201).json(item);
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        error: 'AI risk index already exists for this direction and level',
      });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateAiRiskIndex = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const item = await AiRiskIndex.findByIdAndUpdate(
      req.params.id,
      req.body as IAiRiskIndex,
      { new: true, runValidators: true }
    );
    if (!item) {
      res.status(404).json({ error: 'AI risk index not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        error: 'AI risk index already exists for this direction and level',
      });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteAiRiskIndex = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const item = await AiRiskIndex.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'AI risk index not found' });
      return;
    }
    res.status(200).json({ message: 'AI risk index deleted' });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
