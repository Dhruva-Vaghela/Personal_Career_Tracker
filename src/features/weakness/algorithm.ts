import { SpacedRepetitionData, LearningEvent, ConceptStatus, TrendDirection } from "./types";
import { addDays } from "date-fns";

/**
 * Calculates a derived "quality" score (0-5) for SM-2 based on automated metrics.
 * 5: Perfect response without hesitation (high manual coding, no hints, high success).
 * 4: Correct response after hesitation (some AI usage/hints, high success).
 * 3: Correct response recalled with serious difficulty (high AI usage/hints, moderate success).
 * 2: Incorrect response, but easy to recall upon seeing the correct answer.
 * 1: Incorrect response, remembered upon seeing the correct answer.
 * 0: Complete blackout / failure.
 */
export function calculateSM2Quality(event: LearningEvent): number {
  if (event.userSelfRating !== undefined) {
    return Math.max(0, Math.min(5, event.userSelfRating));
  }

  const success = event.successScore ?? 1;
  const hints = event.hintsUsedRatio ?? 0;
  // If aiUsageRatio is provided, use it. Otherwise, derive from manualCodingRatio if provided.
  let aiUsage = 0;
  if (event.aiUsageRatio !== undefined) {
    aiUsage = event.aiUsageRatio;
  } else if (event.manualCodingRatio !== undefined) {
    aiUsage = 1 - event.manualCodingRatio;
  }

  // Base score heavily dependent on success.
  let score = success * 5; // Max 5

  // Penalize for heavy hint usage
  if (hints > 0) {
    score -= hints * 1.5;
  }

  // Penalize for heavy AI usage
  if (aiUsage > 0) {
    score -= aiUsage * 1.5;
  }

  return Math.round(Math.max(0, Math.min(5, score)));
}

/**
 * Calculates the next spaced repetition state using the SM-2 algorithm.
 */
export function calculateSpacedRepetition(
  previousData: SpacedRepetitionData,
  quality: number,
  now: Date = new Date(),
): SpacedRepetitionData {
  let { interval, easeFactor, repetitions } = previousData;

  if (quality >= 3) {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Failed recall
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    interval,
    easeFactor,
    repetitions,
    nextRevisionDate: addDays(now, interval),
  };
}

/**
 * Calculates the updated difficulty (1-10) based on event performance.
 */
export function calculateAdaptiveDifficulty(
  currentDifficulty: number,
  quality: number,
): number {
  let newDifficulty = currentDifficulty;

  if (quality <= 2) {
    // Struggled - conceptually it's harder than we thought
    newDifficulty += 0.5;
  } else if (quality >= 4) {
    // Found it very easy - it's conceptually easier than we thought
    newDifficulty -= 0.5;
  }

  return Math.max(1, Math.min(10, newDifficulty));
}

/**
 * Calculates the new mastery score based on success and difficulty.
 * Mastery increases faster if the difficulty is high and they succeed.
 */
export function calculateMasteryScore(
  currentMastery: number,
  difficulty: number,
  success: number = 1,
): number {
  // Mastery bump = base bump * difficulty multiplier
  // If difficulty is 10, multiplier is ~1.5x. If difficulty is 1, multiplier is ~0.5x.
  const difficultyMultiplier = 0.5 + difficulty / 10;
  
  let newMastery = currentMastery;
  
  if (success > 0.7) {
    // Good success
    newMastery += 5 * difficultyMultiplier * success;
  } else {
    // Poor success drops mastery
    newMastery -= 5 * (1 - success);
  }

  return Math.max(0, Math.min(100, newMastery));
}

/**
 * Calculates confidence score. High AI usage/hints severely impacts confidence.
 */
export function calculateConfidenceScore(
  currentConfidence: number,
  event: LearningEvent,
): number {
  const success = event.successScore ?? 1;
  const hints = event.hintsUsedRatio ?? 0;
  const aiUsage = event.aiUsageRatio ?? (event.manualCodingRatio !== undefined ? 1 - event.manualCodingRatio : 0);

  let newConfidence = currentConfidence;

  // Pure manual coding builds confidence quickly.
  if (success > 0.8 && aiUsage < 0.2 && hints < 0.2) {
    newConfidence += 8;
  } else if (success > 0.8) {
    // Succeeded, but with help
    newConfidence += 2;
  } else {
    // Failed
    newConfidence -= 10;
  }

  // Penalize confidence if heavily reliant on hints/AI regardless of success
  if (hints > 0.5 || aiUsage > 0.5) {
    newConfidence -= 5;
  }

  return Math.max(0, Math.min(100, newConfidence));
}

export function determineTrend(previousScore: number, newScore: number): TrendDirection {
  const diff = newScore - previousScore;
  if (diff > 2) return "up";
  if (diff < -2) return "down";
  return "flat";
}
