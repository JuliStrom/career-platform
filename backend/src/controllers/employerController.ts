import { Response } from "express";
import mongoose from "mongoose";
import Company from "../models/Company";
import EmployerProfile from "../models/EmployerProfile";
import Job from "../models/Job";
import Profile from "../models/Profile";
import { buildSpecialistSearchPipeline } from "../services/specialistSearch";
import { notifyAboutNewJob, serializeJob } from "../services/jobDto";
import { createNotification } from "../services/notificationDto";
import {
  AuthRequest,
  ContactSpecialistBody,
  CreateEmployerCompanyBody,
  CreateEmployerJobBody,
  CreateEmployerProfileBody,
  EmployerContactKind,
  NotificationType,
  SpecialistWorkFormat,
  UpdateEmployerCompanyBody,
  UpdateEmployerJobBody,
  UpdateEmployerProfileBody,
} from "../types";
import {
  getErrorMessage,
  isMongoDuplicateError,
  isMongooseValidationError,
} from "../utils/errorHandlers";

const EMPLOYER_PROFILE_UPDATE_FIELDS = [
  "name",
  "description",
  "industry",
  "taskType",
  "budgetRange",
] as const satisfies readonly (keyof UpdateEmployerProfileBody)[];
const EMPLOYER_JOB_UPDATE_FIELDS = [
  "title",
  "description",
  "direction",
  "level",
  "workFormat",
  "location",
  "salary",
  "requirements",
  "responsibilities",
  "isActive",
] as const satisfies readonly (keyof UpdateEmployerJobBody)[];

function toPublicEmployerProfile(
  profile: InstanceType<typeof EmployerProfile>,
) {
  return {
    id: profile._id,
    userId: profile.userId,
    name: profile.name,
    description: profile.description,
    industry: profile.industry,
    taskType: profile.taskType,
    budgetRange: profile.budgetRange ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const profile = await EmployerProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      res.status(404).json({ error: "Профиль компании не найден" });
      return;
    }

    res.status(200).json({ profile: toPublicEmployerProfile(profile) });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createProfile = async (
  req: AuthRequest<{}, {}, CreateEmployerProfileBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const profile = await EmployerProfile.create({
      userId: req.user.userId,
      name: req.body.name,
      description: req.body.description,
      industry: req.body.industry,
      taskType: req.body.taskType,
      budgetRange: req.body.budgetRange ?? null,
    });

    res.status(201).json({ profile: toPublicEmployerProfile(profile) });
  } catch (error: unknown) {
    if (isMongooseValidationError(error)) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (isMongoDuplicateError(error)) {
      res.status(409).json({ error: "Профиль компании уже существует" });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateProfile = async (
  req: AuthRequest<{}, {}, UpdateEmployerProfileBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const $set: UpdateEmployerProfileBody = {};
    for (const field of EMPLOYER_PROFILE_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        Object.assign($set, { [field]: req.body[field] });
      }
    }

    const profile = await EmployerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set },
      { new: true, runValidators: true },
    );

    if (!profile) {
      res.status(404).json({ error: "Профиль компании не найден" });
      return;
    }

    res.status(200).json({ profile: toPublicEmployerProfile(profile) });
  } catch (error: unknown) {
    if (isMongooseValidationError(error)) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getCompany = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.findOne({ ownerId: req.user.userId });
    if (!company) {
      res.status(404).json({ error: "Компания не найдена" });
      return;
    }

    res.status(200).json({ company });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createCompany = async (
  req: AuthRequest<{}, {}, CreateEmployerCompanyBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.create({
      ...req.body,
      logo: req.body.logo || null,
      ownerId: req.user.userId,
    });

    res.status(201).json({ company });
  } catch (error: unknown) {
    if (isMongoDuplicateError(error)) {
      res.status(409).json({ error: "Компания уже создана" });
      return;
    }
    if (isMongooseValidationError(error)) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateCompany = async (
  req: AuthRequest<{}, {}, UpdateEmployerCompanyBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const payload = req.body;
    const company = await Company.findOneAndUpdate(
      { ownerId: req.user.userId },
      {
        $set: {
          ...payload,
          ...(payload.logo !== undefined && { logo: payload.logo || null }),
        },
      },
      { new: true, runValidators: true },
    );

    if (!company) {
      res.status(404).json({ error: "Компания не найдена" });
      return;
    }

    if (payload.name !== undefined) {
      await Job.updateMany(
        { companyId: company._id },
        { $set: { company: company.name } },
      );
    }

    res.status(200).json({ company });
  } catch (error: unknown) {
    if (isMongooseValidationError(error)) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const listJobs = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.findOne({ ownerId: req.user.userId }).select(
      "_id",
    );
    if (!company) {
      res.status(404).json({ error: "Компания не найдена" });
      return;
    }

    const jobs = await Job.find({
      companyId: company._id,
      createdBy: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .populate("companyId");

    res.status(200).json({
      jobs: jobs.map(serializeJob),
      total: jobs.length,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createJob = async (
  req: AuthRequest<{}, {}, CreateEmployerJobBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.findOne({ ownerId: req.user.userId });
    if (!company) {
      res.status(400).json({ error: "Сначала создайте компанию" });
      return;
    }

    const job = await Job.create({
      ...req.body,
      company: company.name,
      companyId: company._id,
      createdBy: req.user.userId,
      isActive: true,
    });

    await notifyAboutNewJob(job);
    await job.populate("companyId");
    res.status(201).json(serializeJob(job));
  } catch (error: unknown) {
    if (isMongooseValidationError(error)) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getJob = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.findOne({ ownerId: req.user.userId }).select(
      "_id",
    );
    if (!company) {
      res.status(404).json({ error: "Вакансия не найдена" });
      return;
    }

    const job = await Job.findOne({
      _id: req.params.id,
      companyId: company._id,
      createdBy: req.user.userId,
    }).populate("companyId");
    if (!job) {
      res.status(404).json({ error: "Вакансия не найдена" });
      return;
    }

    res.status(200).json(serializeJob(job));
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateJob = async (
  req: AuthRequest<{ id: string }, {}, UpdateEmployerJobBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.findOne({ ownerId: req.user.userId }).select(
      "_id",
    );
    if (!company) {
      res.status(404).json({ error: "Вакансия не найдена" });
      return;
    }

    const $set: Record<string, unknown> = {};
    for (const field of EMPLOYER_JOB_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        $set[field] = req.body[field];
      }
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: company._id,
        createdBy: req.user.userId,
      },
      { $set },
      { new: true, runValidators: true },
    ).populate("companyId");
    if (!job) {
      res.status(404).json({ error: "Вакансия не найдена" });
      return;
    }

    res.status(200).json(serializeJob(job));
  } catch (error: unknown) {
    if (isMongooseValidationError(error)) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteJob = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const company = await Company.findOne({ ownerId: req.user.userId }).select(
      "_id",
    );
    if (!company) {
      res.status(404).json({ error: "Вакансия не найдена" });
      return;
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: company._id,
        createdBy: req.user.userId,
      },
      { $set: { isActive: false } },
      { new: true },
    ).populate("companyId");
    if (!job) {
      res.status(404).json({ error: "Вакансия не найдена" });
      return;
    }

    res.status(200).json({
      message: "Вакансия успешно деактивирована",
      job: serializeJob(job),
    });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const listSpecialists = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const query = req.query as {
      direction?: string;
      level?: string;
      city?: string;
      format?: SpecialistWorkFormat;
      page?: string;
      limit?: string;
    };

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const [result] = await Profile.aggregate(
      buildSpecialistSearchPipeline(query, page, limit),
    ).allowDiskUse(true);
    const { items = [], total = 0 } = result ?? {};

    res.status(200).json({ items, total, page, limit });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const contactSpecialist = async (
  req: AuthRequest<{ profileId: string }, {}, ContactSpecialistBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const { profileId } = req.params;
    if (!mongoose.isValidObjectId(profileId)) {
      res.status(400).json({ error: "Некорректный ID профиля" });
      return;
    }

    const specialistProfile =
      await Profile.findById(profileId).select("userId name");
    if (!specialistProfile) {
      res.status(404).json({ error: "Специалист не найден" });
      return;
    }

    const company = await Company.findOne({
      ownerId: req.user.userId,
    }).select("name");
    if (!company) {
      res.status(400).json({
        error: "Сначала создайте компанию",
      });
      return;
    }

    const kind = req.body.kind;
    const isOffer = kind === EmployerContactKind.PROJECT_OFFER;
    const dayKey = new Date().toISOString().slice(0, 10);
    const result = await createNotification({
      userId: specialistProfile.userId,
      type: isOffer
        ? NotificationType.EMPLOYER_PROJECT_OFFER
        : NotificationType.EMPLOYER_MESSAGE,
      payload: {
        employerName: company.name,
        employerUserId: req.user.userId,
        specialistName: specialistProfile.name,
        kind,
        message: req.body.message?.trim() || undefined,
      },
      deduplicationKey: `employer-contact:${req.user.userId}:${profileId}:${kind}:${dayKey}`,
    });

    if (result.upsertedCount === 0) {
      res.status(409).json({
        error: "Вы уже отправляли это обращение сегодня",
      });
      return;
    }

    res.status(201).json({ ok: true });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
