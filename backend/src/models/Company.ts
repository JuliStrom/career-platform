import mongoose, { Model, Schema } from 'mongoose';
import {
  GrowthSpeed,
  ICompany,
  TeamSize,
  WorkLanguage,
} from '../types';
import { WorkFormat } from '../types';

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 200,
    },
    logo: {
      type: String,
      default: null,
      trim: true,
    },
    workFormat: {
      type: String,
      required: [true, 'Work format is required'],
      enum: Object.values(WorkFormat),
    },
    valuesTags: {
      type: [String],
      default: [],
    },
    growthSpeed: {
      type: String,
      required: [true, 'Growth speed is required'],
      enum: Object.values(GrowthSpeed),
    },
    teamSize: {
      type: String,
      required: [true, 'Team size is required'],
      enum: Object.values(TeamSize),
    },
    languages: {
      type: [String],
      required: [true, 'Work languages are required'],
      enum: Object.values(WorkLanguage),
      validate: {
        validator: function (v: WorkLanguage[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one work language is required',
      },
    },
    description: {
      type: String,
      required: [true, 'Culture description is required'],
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 1 });

const Company: Model<ICompany> = mongoose.model<ICompany>(
  'Company',
  companySchema
);

export default Company;
