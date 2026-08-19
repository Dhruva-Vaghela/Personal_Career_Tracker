import { CodingProblem, RevisionData } from "../types/models";

export class RevisionService {
  /**
   * Calculates the next suggested revision date based on Spaced Repetition.
   * Uses a simplified algorithm taking confidence and previous revision count into account.
   */
  static calculateNextRevision(problem: CodingProblem): RevisionData {
    const currentRevision = problem.revision || { revisionCount: 0 };
    const newCount = currentRevision.revisionCount + 1;
    
    const now = new Date();
    let daysToAdd = 1;
    
    // Base multiplier grows exponentially with revision count
    const baseMultiplier = Math.pow(2, newCount);
    
    // Confidence factor (1-10) modifies the interval.
    // Higher confidence = longer interval.
    const confidenceFactor = problem.confidenceScore / 5; // e.g. 10/5 = 2x, 5/5 = 1x, 2/5 = 0.4x
    
    daysToAdd = Math.round(baseMultiplier * confidenceFactor);
    
    // Minimum of 1 day, max of 180 days
    if (daysToAdd < 1) daysToAdd = 1;
    if (daysToAdd > 180) daysToAdd = 180;
    
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysToAdd);
    
    return {
      revisionCount: newCount,
      lastRevisionDate: now.toISOString(),
      nextSuggestedRevision: nextDate.toISOString()
    };
  }
}
