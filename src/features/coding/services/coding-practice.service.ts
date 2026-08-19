import { useCodingStore } from "../store/coding-store";
import { CodingProblem, Solution } from "../types/models";
import { RevisionService } from "./revision.service";

export class CodingPracticeService {
  static addProblem(problem: Omit<CodingProblem, "id" | "createdAt" | "updatedAt" | "solutions" | "revision">) {
    useCodingStore.getState().addProblem(problem);
  }

  static updateProblem(id: string, updates: Partial<CodingProblem>) {
    useCodingStore.getState().updateProblem(id, updates);
  }

  static deleteProblem(id: string) {
    useCodingStore.getState().deleteProblem(id);
  }

  static getProblemById(id: string): CodingProblem | undefined {
    return useCodingStore.getState().problems.find(p => p.id === id);
  }

  static addSolutionToProblem(problemId: string, solutionCode: string, language: string, aiReview?: any) {
    const problem = this.getProblemById(problemId);
    if (!problem) return;
    
    const newSolution: Solution = {
      id: crypto.randomUUID(),
      code: solutionCode,
      language,
      aiReview,
      submittedAt: new Date().toISOString()
    };
    
    const updatedSolutions = [...(problem.solutions || []), newSolution];
    this.updateProblem(problemId, { solutions: updatedSolutions });
  }

  static logRevision(problemId: string) {
    const problem = this.getProblemById(problemId);
    if (!problem) return;
    
    const newRevisionData = RevisionService.calculateNextRevision(problem);
    this.updateProblem(problemId, { revision: newRevisionData });
  }

  static deleteSolution(problemId: string, solutionId: string) {
    const problem = this.getProblemById(problemId);
    if (!problem) return;
    
    const updatedSolutions = problem.solutions.filter(s => s.id !== solutionId);
    this.updateProblem(problemId, { solutions: updatedSolutions });
  }

  static updateSolution(problemId: string, solutionId: string, updates: Partial<Solution>) {
    const problem = this.getProblemById(problemId);
    if (!problem) return;
    
    const updatedSolutions = problem.solutions.map(s => 
      s.id === solutionId ? { ...s, ...updates } : s
    );
    this.updateProblem(problemId, { solutions: updatedSolutions });
  }
}
