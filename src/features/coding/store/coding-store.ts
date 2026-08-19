import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CodingProblem } from "../types/models";

export interface CodingState {
  problems: CodingProblem[];
  
  // Actions
  addProblem: (problem: Omit<CodingProblem, "id" | "createdAt" | "updatedAt" | "solutions" | "revision">) => void;
  updateProblem: (id: string, updates: Partial<CodingProblem>) => void;
  deleteProblem: (id: string) => void;
}

export const useCodingStore = create<CodingState>()(
  persist(
    (set) => ({
      problems: [],
      
      addProblem: (problemData) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        
        set((state) => ({
          problems: [
            ...state.problems,
            {
              ...problemData,
              id,
              createdAt: now,
              updatedAt: now,
              solutions: [],
              revision: { revisionCount: 0 },
            },
          ],
        }));
      },
      
      updateProblem: (id, updates) => {
        set((state) => ({
          problems: state.problems.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
      
      deleteProblem: (id) => {
        set((state) => ({
          problems: state.problems.filter((p) => p.id !== id),
        }));
      },
    }),
    {
      name: "engineeros-coding-practice",
    }
  )
);
