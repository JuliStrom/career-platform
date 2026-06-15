import { handleApiError } from '@/shared/config/api';
import { create } from 'zustand';
import * as careerApi from '../api';
import {
  CareerRoadmapResponse,
  CareerTriggerResponse,
  CreateCareerScenarioPayload,
  CareerScenario,
  IScenariosFilters,
  RecommendationsResponse,
} from '../model';

const defaultFilters: IScenariosFilters = {};

interface CareerState {
  isLoading: boolean;
  error: string | null;
  recommendations: RecommendationsResponse | null;
  isLoadingRecommendations: boolean;
  trigger: CareerTriggerResponse | null;
  isLoadingTrigger: boolean;
  roadmap: CareerRoadmapResponse | null;
  isLoadingRoadmap: boolean;

  scenarios: CareerScenario[];
  selectedScenario: CareerScenario | null;
  filters: IScenariosFilters;
  isLoadingScenarios: boolean;
  isDeleting: boolean;
  isUpdating: boolean;

  clearError: () => void;
  createCareerScenario: (
    payload: CreateCareerScenarioPayload
  ) => Promise<CareerScenario>;
  fetchRecommendations: () => Promise<RecommendationsResponse | null>;
  fetchCareerTrigger: () => Promise<CareerTriggerResponse | null>;
  fetchCareerRoadmap: () => Promise<CareerRoadmapResponse | null>;

  setFilters: (partial: Partial<IScenariosFilters>) => void;
  resetFilters: () => void;
  fetchScenarios: () => Promise<void>;
  fetchScenarioById: (id: string) => Promise<void>;
  updateScenario: (
    id: string,
    payload: CreateCareerScenarioPayload
  ) => Promise<CareerScenario>;
  deleteScenario: (id: string) => Promise<void>;
  resetSelectedScenario: () => void;
}

export const useCareerStore = create<CareerState>((set, get) => ({
  isLoading: false,
  error: null,
  recommendations: null,
  isLoadingRecommendations: false,
  trigger: null,
  isLoadingTrigger: false,
  roadmap: null,
  isLoadingRoadmap: false,

  // Scenarios list state
  scenarios: [],
  selectedScenario: null,
  filters: defaultFilters,
  isLoadingScenarios: false,
  isDeleting: false,
  isUpdating: false,

  clearError: () => set({ error: null }),

  createCareerScenario: async (payload: CreateCareerScenarioPayload) => {
    set({ isLoading: true, error: null });
    try {
      const scenario = await careerApi.createCareerScenario(payload);
      set({ isLoading: false });
      return scenario;
    } catch (error) {
      const message = handleApiError(error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchRecommendations: async () => {
    set({ isLoadingRecommendations: true, error: null });
    try {
      const response = await careerApi.getRecommendations();
      set({ recommendations: response, isLoadingRecommendations: false });
      return response;
    } catch (error) {
      const message = handleApiError(error);
      set({
        error: message,
        recommendations: null,
        isLoadingRecommendations: false,
      });
      return null;
    }
  },

  fetchCareerTrigger: async () => {
    set({ isLoadingTrigger: true, error: null });
    try {
      const response = await careerApi.getCareerTrigger();
      set({ trigger: response, isLoadingTrigger: false });
      return response;
    } catch (error) {
      const message = handleApiError(error);
      set({
        error: message,
        trigger: null,
        isLoadingTrigger: false,
      });
      return null;
    }
  },

  fetchCareerRoadmap: async () => {
    set({ isLoadingRoadmap: true, error: null });
    try {
      const response = await careerApi.getCareerRoadmap();
      set({ roadmap: response, isLoadingRoadmap: false });
      return response;
    } catch (error) {
      const message = handleApiError(error);
      set({
        error: message,
        roadmap: null,
        isLoadingRoadmap: false,
      });
      return null;
    }
  },

  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
      },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  fetchScenarios: async () => {
    set({ isLoadingScenarios: true, error: null });
    try {
      const filters = get().filters;
      const scenarios = await careerApi.getScenarios(filters);
      set({ scenarios, isLoadingScenarios: false });
    } catch (error) {
      const message = handleApiError(error);
      set({ error: message, isLoadingScenarios: false });
    }
  },

  fetchScenarioById: async (id: string) => {
    // Сбрасываем выбранный сценарий сразу, чтобы экран редактирования не ловил гонку:
    // «!isLoading && !selectedScenario» до применения isLoadingScenarios: true.
    set({
      isLoadingScenarios: true,
      error: null,
      selectedScenario: null,
    });
    try {
      const scenario = await careerApi.getScenarioById(id);
      set({ selectedScenario: scenario, isLoadingScenarios: false });
    } catch (error) {
      const message = handleApiError(error);
      set({
        error: message,
        isLoadingScenarios: false,
        selectedScenario: null,
      });
    }
  },

  updateScenario: async (id: string, payload: CreateCareerScenarioPayload) => {
    set({ isUpdating: true, error: null });
    try {
      const scenario = await careerApi.updateScenario(id, payload);
      set((state) => ({
        scenarios: state.scenarios.map((s) => (s._id === id ? scenario : s)),
        selectedScenario:
          state.selectedScenario?._id === id
            ? scenario
            : state.selectedScenario,
        isUpdating: false,
      }));
      return scenario;
    } catch (error) {
      const message = handleApiError(error);
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  deleteScenario: async (id: string) => {
    set({ isDeleting: true, error: null });
    try {
      await careerApi.deleteScenario(id);
      set((state) => ({
        scenarios: state.scenarios.filter((s) => s._id !== id),
        selectedScenario:
          state.selectedScenario?._id === id ? null : state.selectedScenario,
        isDeleting: false,
      }));
    } catch (error) {
      const message = handleApiError(error);
      set({ error: message, isDeleting: false });
      throw error;
    }
  },

  resetSelectedScenario: () => set({ selectedScenario: null }),
}));
