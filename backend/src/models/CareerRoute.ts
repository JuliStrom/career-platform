import mongoose, { Schema, Model } from 'mongoose';
import { ICareerRoute } from '../types/careerRoute';
import { Direction } from '../types';

const careerRouteSchema = new Schema<ICareerRoute>(
  {
    direction: {
      type: String,
      required: true,
      enum: Object.values(Direction),
    },
    fromCity: {
      type: String,
      default: null,
      trim: true,
    },
    toCountry: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    steps: {
      type: Schema.Types.Mixed,
      required: true,
      default: [],
    },
    resources: {
      type: Schema.Types.Mixed,
      required: true,
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

careerRouteSchema.index({ direction: 1, toCountry: 1 });
careerRouteSchema.index({ isFeatured: 1, direction: 1 });

const CareerRoute: Model<ICareerRoute> = mongoose.model<ICareerRoute>(
  'CareerRoute',
  careerRouteSchema,
  'career_routes'
);

export default CareerRoute;
