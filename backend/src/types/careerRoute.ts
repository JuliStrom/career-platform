import { Document } from 'mongoose';
import { Direction } from './profileEnums';

export interface ICareerRoute extends Document {
  direction: Direction;
  fromCity?: string | null;
  toCountry: string;
  title: string;
  steps: unknown;
  resources: unknown;
  isFeatured: boolean;
}
