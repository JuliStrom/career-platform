import mongoose, { Schema, Model } from 'mongoose';
import {
  IProfile,
  Direction,
  Level,
  CareerGoal,
  City,
  EmploymentType,
  ProfileLang,
} from '../types';
import { computeYearsInCurrentRole } from '../utils/profileYears';
import { normalizeProfileDirections } from '../utils/profileDirections';

// Схема профиля
const profileSchema = new Schema<IProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  portfolioPdfData: {
    type: Buffer,
    default: null,
  },
  portfolioPdfContentType: {
    type: String,
    default: null,
  },
  portfolioPdfName: {
    type: String,
    maxlength: 255,
    default: null,
    trim: true,
  },
  certificatePdfs: {
    type: [
      {
        name: {
          type: String,
          required: true,
          maxlength: 255,
          trim: true,
        },
        contentType: {
          type: String,
          required: true,
          default: 'application/pdf',
        },
        data: {
          type: Buffer,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
  directions: {
    type: [String],
    required: [true, 'Направление обязательно'],
    enum: Object.values(Direction),
    validate: {
      validator(value: string[]) {
        if (!Array.isArray(value)) return false;
        if (value.length < 1 || value.length > 3) return false;
        return new Set(value).size === value.length;
      },
      message: 'Можно выбрать от 1 до 3 уникальных направлений',
    },
  },
  level: {
    type: String,
    required: [true, 'Уровень обязателен'],
    enum: Object.values(Level),
  },
  skills: {
    type: [String],
    required: [true, 'Навыки обязательны'],
    validate: {
      validator: function(v: string[]) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Должен быть хотя бы один навык',
    },
  },
  experience: {
    type: String,
    required: [true, 'Опыт обязателен'],
  },
  careerGoal: {
    type: String,
    required: [true, 'Карьерная цель обязательна'],
    enum: Object.values(CareerGoal),
  },
  careerStartDate: {
    type: Date,
    default: null,
  },
  currentCompany: {
    type: String,
    maxlength: 255,
    default: null,
    trim: true,
  },
  city: {
    type: String,
    enum: Object.values(City),
    default: null,
  },
  relocationFromCity: {
    type: String,
    enum: ['kazakhstan'],
    default: null,
  },
  relocationToCountry: {
    type: String,
    maxlength: 80,
    default: null,
    trim: true,
  },
  employmentType: {
    type: String,
    enum: Object.values(EmploymentType),
    default: null,
  },
  lang: {
    type: String,
    enum: Object.values(ProfileLang),
    default: ProfileLang.RU,
  },
  wantsRelocation: {
    type: Boolean,
    default: false,
  },
  careerChangeTrackActive: {
    type: Boolean,
    default: false,
  },
  careerChangeCurrentField: {
    type: String,
    maxlength: 500,
    default: null,
    trim: true,
  },
  careerChangeTargetDirection: {
    type: String,
    default: null,
    maxlength: 80,
  },
  careerChangeAgeRange: {
    type: String,
    default: null,
    maxlength: 32,
  },
  careerChangeMotivation: {
    type: String,
    default: null,
    maxlength: 32,
  },
  careerChangeTimeline: {
    type: String,
    default: null,
    maxlength: 32,
  },
  favoriteJobs: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Job',
    }],
    default: [], // По умолчанию пустой массив
  },
}, {
  timestamps: true,
});

profileSchema.pre('validate', function () {
  const directions = normalizeProfileDirections({
    direction: (this as { direction?: unknown }).direction,
    directions: this.directions,
  });
  if (directions.length > 0) {
    this.directions = directions;
  }
});

// Employer search: chronological feed and common direction/level filters.
profileSchema.index({ updatedAt: -1, _id: -1 });
profileSchema.index({ directions: 1, updatedAt: -1, _id: -1 });
profileSchema.index({ directions: 1, level: 1, updatedAt: -1, _id: -1 });
profileSchema.index({ city: 1, updatedAt: -1, _id: -1 });

profileSchema.virtual('yearsInCurrentRole').get(function (this: IProfile) {
  return computeYearsInCurrentRole(this.careerStartDate);
});

profileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    const plain = ret as unknown as {
      lang?: string | null;
      wantsRelocation?: boolean | null;
      careerChangeTrackActive?: boolean | null;
      directions?: unknown;
      portfolioPdfData?: unknown;
      certificatePdfs?: { data?: unknown }[];
    };
    if (plain.lang == null) plain.lang = ProfileLang.RU;
    if (plain.wantsRelocation == null) plain.wantsRelocation = false;
    if (plain.careerChangeTrackActive == null) plain.careerChangeTrackActive = false;
    plain.directions = normalizeProfileDirections(plain);
    delete (plain as { direction?: unknown }).direction;
    delete plain.portfolioPdfData;
    if (Array.isArray(plain.certificatePdfs)) {
      plain.certificatePdfs = plain.certificatePdfs.map((certificate) => {
        const { data: _data, ...metadata } = certificate;
        return metadata;
      });
    }
    return ret;
  },
});

profileSchema.set('toObject', { virtuals: true });

const Profile: Model<IProfile> = mongoose.model<IProfile>('Profile', profileSchema);

export default Profile;
