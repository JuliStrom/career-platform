import mongoose, { Model, Schema } from 'mongoose';
import { ISkillCategory } from '../types/skill';

const skillCategorySchema = new Schema<ISkillCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 40,
    },
  },
  { timestamps: false }
);

const SkillCategory: Model<ISkillCategory> = mongoose.model<ISkillCategory>(
  'SkillCategory',
  skillCategorySchema,
  'skill_categories'
);

export default SkillCategory;
