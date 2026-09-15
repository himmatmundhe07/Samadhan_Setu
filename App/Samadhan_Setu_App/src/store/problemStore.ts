/**
 * Samadhan Setu — Problem Store (Zustand)
 * Manages user's own reports, public feed, and offline queue state.
 */
import { create } from 'zustand';
import { ProblemStatus } from '../utils/statusConfig';
import { CategoryId } from '../utils/categories';

export interface Problem {
  id: string;
  title?: string;
  description?: string;
  category: CategoryId;
  status: ProblemStatus;
  images: string[];      // URIs
  voiceNote?: string;    // Audio URI
  location: {
    latitude: number;
    longitude: number;
    district: string;
    address?: string;
  };
  submittedBy: string;   // user ID
  submittedAt: string;   // ISO date
  updatedAt: string;
  supportCount: number;  // "me too" count
  assignedTo?: string;
  resolvedAt?: string;
  beforeImage?: string;
  afterImage?: string;
  rating?: number;       // 1-5
  isConfirmedResolved: boolean;
  isEmergency: boolean;
  // Offline queue
  isSynced: boolean;
  isLocalDraft: boolean;
  editableUntil?: string; // ISO date (10-min edit window)
}

interface ProblemState {
  myProblems: Problem[];
  publicProblems: Problem[];
  currentProblem: Problem | null;
  pendingSyncCount: number;
  isLoading: boolean;
  filters: {
    category: CategoryId | null;
    district: string | null;
  };

  // Actions
  setMyProblems: (problems: Problem[]) => void;
  addMyProblem: (problem: Problem) => void;
  setPublicProblems: (problems: Problem[]) => void;
  setCurrentProblem: (problem: Problem | null) => void;
  updateProblemStatus: (id: string, status: ProblemStatus) => void;
  setPendingSyncCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<ProblemState['filters']>) => void;
  confirmResolution: (id: string, confirmed: boolean) => void;
  rateProblem: (id: string, rating: number) => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
  myProblems: [],
  publicProblems: [],
  currentProblem: null,
  pendingSyncCount: 0,
  isLoading: false,
  filters: {
    category: null,
    district: null,
  },

  setMyProblems: (myProblems) => set({ myProblems }),

  addMyProblem: (problem) =>
    set((state) => ({
      myProblems: [problem, ...state.myProblems],
    })),

  setPublicProblems: (publicProblems) => set({ publicProblems }),
  setCurrentProblem: (currentProblem) => set({ currentProblem }),

  updateProblemStatus: (id, status) =>
    set((state) => ({
      myProblems: state.myProblems.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
      currentProblem:
        state.currentProblem?.id === id
          ? { ...state.currentProblem, status, updatedAt: new Date().toISOString() }
          : state.currentProblem,
    })),

  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
  setLoading: (isLoading) => set({ isLoading }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  confirmResolution: (id, confirmed) =>
    set((state) => {
      const newStatus: ProblemStatus = confirmed ? 'resolved' : 'disputed';
      return {
        myProblems: state.myProblems.map((p) =>
          p.id === id
            ? { ...p, status: newStatus, isConfirmedResolved: confirmed }
            : p
        ),
        publicProblems: state.publicProblems.map((p) =>
          p.id === id
            ? { ...p, status: newStatus, isConfirmedResolved: confirmed }
            : p
        ),
        currentProblem:
          state.currentProblem?.id === id
            ? { ...state.currentProblem, status: newStatus, isConfirmedResolved: confirmed }
            : state.currentProblem,
      };
    }),

  rateProblem: (id, rating) =>
    set((state) => ({
      myProblems: state.myProblems.map((p) =>
        p.id === id ? { ...p, rating } : p
      ),
      publicProblems: state.publicProblems.map((p) =>
        p.id === id ? { ...p, rating } : p
      ),
      currentProblem:
        state.currentProblem?.id === id
          ? { ...state.currentProblem, rating }
          : state.currentProblem,
    })),
}));
