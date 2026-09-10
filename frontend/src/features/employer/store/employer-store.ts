import { handleApiError } from '@/shared/config/api';
import { isAxiosError } from 'axios';
import { create } from 'zustand';
import * as employerApi from '../api/employer.api';
import type {
  Company,
  CompanyPayload,
  ContactSpecialistPayload,
  CreateEmployerJobPayload,
  EmployerJobPayload,
  EmployerProfile,
  EmployerProfilePayload,
  SpecialistCard,
  SpecialistFilters,
} from '../model';
import type { Job } from '@/features/jobs/model';

interface EmployerState {
  company: Company | null;
  companyHydrated: boolean;
  ownJobs: Job[];
  ownJobsTotal: number;
  selectedOwnJob: Job | null;
  profile: EmployerProfile | null;
  profileHydrated: boolean;
  specialists: SpecialistCard[];
  specialistsPage: number;
  specialistsTotal: number;
  specialistsLimit: number;
  specialistsRequestId: number;
  filters: SpecialistFilters;
  isLoadingCompany: boolean;
  isSavingCompany: boolean;
  isLoadingOwnJobs: boolean;
  isSavingOwnJob: boolean;
  isDeactivatingOwnJob: boolean;
  isLoadingProfile: boolean;
  isSavingProfile: boolean;
  isLoadingSpecialists: boolean;
  contactingId: string | null;
  error: string | null;
  fetchCompany: () => Promise<void>;
  saveCompany: (payload: CompanyPayload) => Promise<void>;
  fetchOwnJobs: () => Promise<void>;
  fetchOwnJob: (id: string) => Promise<void>;
  createOwnJob: (payload: CreateEmployerJobPayload) => Promise<Job>;
  updateOwnJob: (
    id: string,
    payload: Partial<EmployerJobPayload>
  ) => Promise<Job>;
  deactivateOwnJob: (id: string) => Promise<void>;
  resetSelectedOwnJob: () => void;
  fetchProfile: () => Promise<void>;
  saveProfile: (payload: EmployerProfilePayload) => Promise<void>;
  setFilters: (filters: SpecialistFilters) => void;
  fetchSpecialists: (page?: number) => Promise<void>;
  contactSpecialist: (
    profileId: string,
    payload: ContactSpecialistPayload
  ) => Promise<void>;
  reset: () => void;
}

export const useEmployerStore = create<EmployerState>((set, get) => ({
  company: null,
  companyHydrated: false,
  ownJobs: [],
  ownJobsTotal: 0,
  selectedOwnJob: null,
  profile: null,
  profileHydrated: false,
  specialists: [],
  specialistsPage: 1,
  specialistsTotal: 0,
  specialistsLimit: 20,
  specialistsRequestId: 0,
  filters: {},
  isLoadingCompany: false,
  isSavingCompany: false,
  isLoadingOwnJobs: false,
  isSavingOwnJob: false,
  isDeactivatingOwnJob: false,
  isLoadingProfile: false,
  isSavingProfile: false,
  isLoadingSpecialists: false,
  contactingId: null,
  error: null,

  fetchCompany: async () => {
    set({ isLoadingCompany: true, error: null });
    try {
      const company = await employerApi.getCompany();
      set({ company, companyHydrated: true, isLoadingCompany: false });
    } catch (error) {
      set({
        companyHydrated: true,
        isLoadingCompany: false,
        error: handleApiError(error),
      });
    }
  },

  saveCompany: async (payload) => {
    set({ isSavingCompany: true, error: null });
    try {
      const company = get().company
        ? await employerApi.updateCompany(payload)
        : await employerApi.createCompany(payload);
      set({ company, companyHydrated: true, isSavingCompany: false });
    } catch (error) {
      set({ isSavingCompany: false, error: handleApiError(error) });
      throw error;
    }
  },

  fetchOwnJobs: async () => {
    set({ isLoadingOwnJobs: true, error: null });
    try {
      const { jobs, total } = await employerApi.getOwnJobs();
      set({ ownJobs: jobs, ownJobsTotal: total, isLoadingOwnJobs: false });
    } catch (error) {
      set({ isLoadingOwnJobs: false, error: handleApiError(error) });
    }
  },

  fetchOwnJob: async (id) => {
    set({ isLoadingOwnJobs: true, selectedOwnJob: null, error: null });
    try {
      const job = await employerApi.getOwnJob(id);
      set({ selectedOwnJob: job, isLoadingOwnJobs: false });
    } catch (error) {
      set({ isLoadingOwnJobs: false, error: handleApiError(error) });
    }
  },

  createOwnJob: async (payload) => {
    set({ isSavingOwnJob: true, error: null });
    try {
      const job = await employerApi.createOwnJob(payload);
      set((state) => ({
        ownJobs: [job, ...state.ownJobs],
        ownJobsTotal: state.ownJobsTotal + 1,
        isSavingOwnJob: false,
      }));
      return job;
    } catch (error) {
      set({ isSavingOwnJob: false, error: handleApiError(error) });
      throw error;
    }
  },

  updateOwnJob: async (id, payload) => {
    set({ isSavingOwnJob: true, error: null });
    try {
      const job = await employerApi.updateOwnJob(id, payload);
      set((state) => ({
        ownJobs: state.ownJobs.map((item) => (item._id === id ? job : item)),
        selectedOwnJob: job,
        isSavingOwnJob: false,
      }));
      return job;
    } catch (error) {
      set({ isSavingOwnJob: false, error: handleApiError(error) });
      throw error;
    }
  },

  deactivateOwnJob: async (id) => {
    set({ isDeactivatingOwnJob: true, error: null });
    try {
      await employerApi.deactivateOwnJob(id);
      set((state) => ({
        ownJobs: state.ownJobs.map((job) =>
          job._id === id ? { ...job, isActive: false } : job
        ),
        selectedOwnJob:
          state.selectedOwnJob?._id === id
            ? { ...state.selectedOwnJob, isActive: false }
            : state.selectedOwnJob,
        isDeactivatingOwnJob: false,
      }));
    } catch (error) {
      set({ isDeactivatingOwnJob: false, error: handleApiError(error) });
      throw error;
    }
  },

  resetSelectedOwnJob: () => set({ selectedOwnJob: null }),

  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });
    try {
      const profile = await employerApi.getEmployerProfile();
      set({ profile, profileHydrated: true, isLoadingProfile: false });
    } catch (error) {
      set({
        isLoadingProfile: false,
        error: handleApiError(error),
      });
    }
  },

  saveProfile: async (payload) => {
    set({ isSavingProfile: true, error: null });
    try {
      const current = get().profile;
      const profile = current
        ? await employerApi.updateEmployerProfile(payload)
        : await employerApi.createEmployerProfile(payload);
      set({ profile, profileHydrated: true, isSavingProfile: false });
    } catch (error) {
      set({
        isSavingProfile: false,
        error: handleApiError(error),
      });
      throw error;
    }
  },

  setFilters: (filters) =>
    set((state) => ({
      filters,
      specialists: [],
      specialistsPage: 1,
      specialistsTotal: 0,
      isLoadingSpecialists: false,
      specialistsRequestId: state.specialistsRequestId + 1,
    })),

  fetchSpecialists: async (page = get().specialistsPage) => {
    const requestId = get().specialistsRequestId + 1;
    const filters = get().filters;
    set({
      isLoadingSpecialists: true,
      error: null,
      specialistsRequestId: requestId,
    });
    try {
      let response = await employerApi.listSpecialists(filters, page);
      if (get().specialistsRequestId !== requestId) return;
      const lastPage = Math.max(1, Math.ceil(response.total / response.limit));
      if (response.page > lastPage) {
        response = await employerApi.listSpecialists(filters, lastPage);
        if (get().specialistsRequestId !== requestId) return;
      }
      set({
        specialists: response.items,
        specialistsPage: response.page,
        specialistsTotal: response.total,
        specialistsLimit: response.limit,
        isLoadingSpecialists: false,
      });
    } catch (error) {
      if (get().specialistsRequestId !== requestId) return;
      set({
        isLoadingSpecialists: false,
        error: handleApiError(error),
      });
    }
  },

  contactSpecialist: async (profileId, payload) => {
    set({ contactingId: profileId, error: null });
    try {
      await employerApi.contactSpecialist(profileId, payload);
      set({ contactingId: null });
    } catch (error) {
      const message =
        isAxiosError(error) && error.response?.status === 409
          ? 'alreadySent'
          : isAxiosError(error) && error.response?.status === 400
            ? 'needProfile'
            : handleApiError(error);
      set({ contactingId: null, error: message });
      throw error;
    }
  },

  reset: () =>
    set({
      specialistsPage: 1,
      specialistsTotal: 0,
      specialistsLimit: 20,
      specialistsRequestId: get().specialistsRequestId + 1,
      company: null,
      companyHydrated: false,
      ownJobs: [],
      ownJobsTotal: 0,
      selectedOwnJob: null,
      profile: null,
      profileHydrated: false,
      specialists: [],
      filters: {},
      isLoadingCompany: false,
      isSavingCompany: false,
      isLoadingOwnJobs: false,
      isSavingOwnJob: false,
      isDeactivatingOwnJob: false,
      isLoadingProfile: false,
      isSavingProfile: false,
      isLoadingSpecialists: false,
      contactingId: null,
      error: null,
    }),
}));
