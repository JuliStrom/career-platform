import { Response } from 'express';
import Company from '../models/Company';
import Job from '../models/Job';
import { AuthRequest, CompanyCultureBody } from '../types';
import { getErrorMessage } from '../utils/errorHandlers';

export const listCompanies = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filter = search
      ? { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      : {};
    const companies = await Company.find(filter).sort({ name: 1 });
    res.status(200).json(companies);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const getCompanyById = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.status(200).json(company);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createCompany = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as CompanyCultureBody;
    const company = await Company.create({
      ...body,
      logo: body.logo || null,
    });
    res.status(201).json(company);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const updateCompany = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const payload = req.body as Partial<CompanyCultureBody>;
    const body = {
      ...payload,
      ...(payload.logo !== undefined && { logo: payload.logo || null }),
    };
    const company = await Company.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.status(200).json(company);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteCompany = async (
  req: AuthRequest<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    await Job.updateMany({ companyId: company._id }, { $unset: { companyId: 1 } });
    await company.deleteOne();
    res.status(200).json({ message: 'Company deleted' });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
