import mongoose, { Schema, Model } from 'mongoose';
import {ILearningResource} from "../types";

const learningResourceSchema = new Schema<ILearningResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      default: null,
      maxlength: 100,
      trim: true,
    },
    type: {
      type: String,
      default: null,
      maxlength: 100,
      trim: true,
    },
    direction: {
      type: String,
      default: null,
      trim: true,
    },
    level: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    url: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator(v: string | null) {
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Некорректный URL',
      },
    },
    isInternational: {
      type: Boolean,
      default: false,
    },
    durationWeeks: {
      type: Number,
      default: null,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    locationType: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online',
    },
    city: {
      type: String,
      default: null,
      maxlength: 100,
      trim: true,
    },
    country: {
      type: String,
      default: null,
      maxlength: 100,
      trim: true,
    },
    targetCountry: {
      type: String,
      default: null,
      maxlength: 100,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator(tags: string[]) {
          return Array.isArray(tags) && tags.length > 0 && tags.every((t) => t.trim().length > 0);
        },
        message: 'Нужен хотя бы один непустой тег',
      },
    },
    skillsTags: {
      type: Schema.Types.Mixed,
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isReskilling: {
      type: Boolean,
      default: false,
    },
    isAdminEducationCard: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

learningResourceSchema.index({ isActive: 1, sortOrder: 1 });
learningResourceSchema.index({ tags: 1 });
learningResourceSchema.index({ direction: 1, level: 1 });
learningResourceSchema.index({ isFeatured: 1 });
learningResourceSchema.index({ isReskilling: 1 });
learningResourceSchema.index({ isAdminEducationCard: 1, sortOrder: 1 });
learningResourceSchema.index({ isInternational: 1, targetCountry: 1 });

const LearningResource: Model<ILearningResource> = mongoose.model<ILearningResource>(
  'LearningResource',
  learningResourceSchema
);

export default LearningResource;
