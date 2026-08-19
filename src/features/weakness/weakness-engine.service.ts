import {
  ConceptStatus,
  LearningEvent,
  SpacedRepetitionData,
} from "./types";
import {
  calculateSM2Quality,
  calculateSpacedRepetition,
  calculateAdaptiveDifficulty,
  calculateMasteryScore,
  calculateConfidenceScore,
  determineTrend,
} from "./algorithm";
import { addDays, differenceInDays } from "date-fns";

export class WeaknessEngineService {
  /**
   * Processes a new learning event and updates the relevant concepts.
   * Pure function: returns a new array of updated concepts.
   */
  public processEvent(
    event: LearningEvent,
    currentConcepts: ConceptStatus[],
  ): ConceptStatus[] {
    const updatedConcepts = [...currentConcepts];

    for (const conceptId of event.conceptIds) {
      const index = updatedConcepts.findIndex((c) => c.id === conceptId);
      if (index === -1) {
        // Concept hasn't been tracked yet, initialize it
        updatedConcepts.push(this.initializeConcept(conceptId, event));
      } else {
        // Update existing concept
        updatedConcepts[index] = this.updateConcept(updatedConcepts[index], event);
      }
    }

    return updatedConcepts;
  }

  /**
   * Retrieves the list of concepts that are due for revision today or overdue,
   * sorted by their revision priority (highest first).
   */
  public getDueRevisions(concepts: ConceptStatus[], limit?: number): ConceptStatus[] {
    const now = new Date();

    const dueConcepts = concepts.map((concept) => {
      // Recalculate priority to ensure it's up to date based on the current time
      const updatedConcept = {
        ...concept,
        revisionPriority: this.calculatePriority(concept, now),
      };
      return updatedConcept;
    }).filter((concept) => {
      // It's due if the nextRevisionDate is in the past, or priority is very high
      return concept.spacedRepetition.nextRevisionDate <= now || concept.revisionPriority > 80;
    });

    // Sort by priority descending
    dueConcepts.sort((a, b) => b.revisionPriority - a.revisionPriority);

    if (limit && limit > 0) {
      return dueConcepts.slice(0, limit);
    }

    return dueConcepts;
  }

  /**
   * Calculate a dynamic 0-100 priority score based on how overdue the concept is,
   * combined with its mastery and difficulty.
   */
  public calculatePriority(concept: ConceptStatus, now: Date = new Date()): number {
    const daysOverdue = differenceInDays(now, concept.spacedRepetition.nextRevisionDate);
    
    // Base priority is mostly driven by the SM-2 schedule
    let priority = 0;
    
    if (daysOverdue > 0) {
      // If overdue, priority shoots up quickly (cap at 60 for the time component)
      priority += Math.min(60, daysOverdue * 10);
    } else if (daysOverdue === 0) {
      // Due today
      priority = 40;
    } else {
      // Not due yet, priority is minimal unless it's a known extreme weakness
      priority = Math.max(0, 10 + daysOverdue * 2); // daysOverdue is negative here
    }

    // Add weakness factor: low mastery and low confidence increase priority
    const weaknessFactor = ((100 - concept.masteryScore) + (100 - concept.confidenceScore)) / 4;
    priority += weaknessFactor;

    // Add difficulty factor
    priority += (concept.difficulty / 10) * 10;

    return Math.max(0, Math.min(100, Math.round(priority)));
  }

  private initializeConcept(id: string, event: LearningEvent): ConceptStatus {
    const quality = calculateSM2Quality(event);
    
    const initialDifficulty = calculateAdaptiveDifficulty(5, quality); // start at median difficulty 5
    const initialMastery = calculateMasteryScore(0, initialDifficulty, event.successScore);
    const initialConfidence = calculateConfidenceScore(50, event);

    const initialSpacedRepetition: SpacedRepetitionData = {
      interval: 1,
      easeFactor: 2.5,
      repetitions: quality >= 3 ? 1 : 0,
      nextRevisionDate: addDays(event.timestamp, 1),
    };

    const concept: ConceptStatus = {
      id,
      name: `Concept ${id}`, // In reality, this would be looked up from a DB
      difficulty: initialDifficulty,
      masteryScore: initialMastery,
      confidenceScore: initialConfidence,
      lastPracticed: event.timestamp,
      spacedRepetition: initialSpacedRepetition,
      trend: "flat",
      revisionPriority: 0, // Calculated dynamically later
    };

    concept.revisionPriority = this.calculatePriority(concept, event.timestamp);
    return concept;
  }

  private updateConcept(concept: ConceptStatus, event: LearningEvent): ConceptStatus {
    const quality = calculateSM2Quality(event);
    
    const newDifficulty = calculateAdaptiveDifficulty(concept.difficulty, quality);
    const newMastery = calculateMasteryScore(concept.masteryScore, concept.difficulty, event.successScore);
    const newConfidence = calculateConfidenceScore(concept.confidenceScore, event);
    const newSpacedRepetition = calculateSpacedRepetition(concept.spacedRepetition, quality, event.timestamp);

    // Composite score to determine trend (average of mastery and confidence)
    const oldAvg = (concept.masteryScore + concept.confidenceScore) / 2;
    const newAvg = (newMastery + newConfidence) / 2;

    const updatedConcept: ConceptStatus = {
      ...concept,
      difficulty: newDifficulty,
      masteryScore: newMastery,
      confidenceScore: newConfidence,
      lastPracticed: event.timestamp,
      spacedRepetition: newSpacedRepetition,
      trend: determineTrend(oldAvg, newAvg),
      revisionPriority: 0,
    };

    updatedConcept.revisionPriority = this.calculatePriority(updatedConcept, event.timestamp);
    
    return updatedConcept;
  }
}

// Export a singleton instance for easy usage
export const weaknessEngine = new WeaknessEngineService();
