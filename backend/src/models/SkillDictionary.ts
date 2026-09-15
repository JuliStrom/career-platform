import mongoose, { Model, Schema } from 'mongoose';
import { ISkillDictionary } from '../types/skill';

const skillDictionarySchema = new Schema<ISkillDictionary>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    nameNormalized: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillCategory',
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: false }
);

const SkillDictionary: Model<ISkillDictionary> = mongoose.model<ISkillDictionary>(
  'SkillDictionary',
  skillDictionarySchema,
  'skills_dictionary'
);

export default SkillDictionary;
