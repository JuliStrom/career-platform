import { Response } from 'express';
import CareerTrigger from '../models/CareerTrigger';
import { AuthRequest, ICareerTrigger } from '../types';
import { getErrorMessage } from '../utils/errorHandlers';

type CareerTriggerBody = Pick<
  ICareerTrigger,
  | 'direction'
  | 'currentLevel'
  | 'minYears'
  | 'triggerTitle'
  | 'triggerDescription'
  | 'nextSteps'
  | 'ctaType'
  | 'specialCase'
  | 'isActive'
  | 'sortOrder'
>;

export const listCareerTriggers = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const items = await CareerTrigger.find().sort({
      sortOrder: 1,
      currentLevel: 1,
      minYears: 1,
    });
    res.status(200).json(items);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getCareerTriggerById = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const item = await CareerTrigger.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Career trigger not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createCareerTrigger = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await CareerTrigger.create(req.body as CareerTriggerBody);
    res.status(201).json(item);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateCareerTrigger = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as CareerTriggerBody;
    const item = await CareerTrigger.findByIdAndUpdate(
      req.params.id,
      {
        $set: body,
        ...(!body.specialCase && { $unset: { specialCase: 1 } }),
      },
      { new: true, runValidators: true }
    );
    if (!item) {
      res.status(404).json({ error: 'Career trigger not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteCareerTrigger = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const item = await CareerTrigger.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Career trigger not found' });
      return;
    }
    res.status(200).json({ message: 'Career trigger deleted' });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
