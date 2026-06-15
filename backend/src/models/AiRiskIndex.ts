import mongoose, { Model, Schema } from 'mongoose';
import { Direction, Level } from '../types/profileEnums';
import { AiRiskLevel, IAiRiskIndex } from '../types/aiRiskIndex';

export interface IAiRiskIndexDocument extends IAiRiskIndex, mongoose.Document {}

const aiRiskIndexSchema = new Schema<IAiRiskIndexDocument>(
  {
    direction: {
      type: String,
      required: true,
      enum: Object.values(Direction),
    },
    level: {
      type: String,
      required: true,
      enum: Object.values(Level),
    },
    riskLevel: {
      type: String,
      required: true,
      enum: Object.values(AiRiskLevel),
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskDescription: {
      type: String,
      required: true,
      trim: true,
    },
    protectiveSkills: {
      type: [String],
      required: true,
      validate: {
        validator(skills: string[]) {
          return Array.isArray(skills) && skills.length >= 3 && skills.length <= 8;
        },
        message: 'protectiveSkills: от 3 до 8 навыков',
      },
    },
  },
  {
    timestamps: true,
    collection: 'ai_risk_index',
  }
);

aiRiskIndexSchema.index({ direction: 1, level: 1 }, { unique: true });

const AiRiskIndex: Model<IAiRiskIndexDocument> =
  mongoose.models.AiRiskIndex ||
  mongoose.model<IAiRiskIndexDocument>('AiRiskIndex', aiRiskIndexSchema);

export default AiRiskIndex;
