import mongoose, { Model, Schema } from "mongoose";
import {
  Direction,
  EmployerBudgetRange,
  EmployerTaskType,
  IEmployerProfile,
} from "../types";

const employerProfileSchema = new Schema<IEmployerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Название компании обязательно"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Описание обязательно"],
      trim: true,
      minlength: [10, "Описание должно содержать минимум 10 символов"],
      maxlength: 2000,
    },
    industry: {
      type: String,
      required: [true, "Сфера обязательна"],
      enum: Object.values(Direction),
    },
    taskType: {
      type: String,
      required: [true, "Тип задач обязателен"],
      enum: Object.values(EmployerTaskType),
    },
    budgetRange: {
      type: String,
      enum: Object.values(EmployerBudgetRange),
      default: null,
    },
  },
  { timestamps: true },
);

const EmployerProfile: Model<IEmployerProfile> =
  mongoose.model<IEmployerProfile>("EmployerProfile", employerProfileSchema);

export default EmployerProfile;
