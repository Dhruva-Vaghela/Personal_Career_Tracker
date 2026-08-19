export type TrendDirection = "up" | "down" | "flat";

export type SpacedRepetitionData = {
  /** The current interval in days before the next review is needed. */
  interval: number;
  /** The ease factor (multiplier) for the next interval (defaults to 2.5). */
  easeFactor: number;
  /** Number of consecutive successful repetitions. */
  repetitions: number;
  /** The exact date when this concept should be reviewed next. */
  nextRevisionDate: Date;
};

export type ConceptStatus = {
  id: string;
  name: string;

  /** Score from 0 to 100 representing how confident the user feels or performs. */
  confidenceScore: number;
  /** Score from 0 to 100 representing overall objective mastery based on completion and history. */
  masteryScore: number;
  /** Subjective or computed difficulty from 1 (very easy) to 10 (extremely hard). */
  difficulty: number;
  /** Up if improving, down if failing/forgetting, flat if stable. */
  trend: TrendDirection;

  lastPracticed: Date;
  /** Dynamic score 0-100 indicating how urgently this needs revision. */
  revisionPriority: number;

  spacedRepetition: SpacedRepetitionData;
};

export type LearningEventType =
  | "coding_exercise"
  | "project"
  | "journal_entry"
  | "github_activity"
  | "revision_session";

export type LearningEvent = {
  id: string;
  type: LearningEventType;
  timestamp: Date;
  /** The concepts that this event applies to. */
  conceptIds: string[];

  /** Scale of 0 to 1. 0 = no hints, 1 = maximum hints used. */
  hintsUsedRatio?: number;
  /** Scale of 0 to 1. 0 = purely manual code, 1 = fully AI generated. */
  aiUsageRatio?: number;
  /** Scale of 0 to 1. 1 = entirely manual coding without AI. (Inverse of aiUsageRatio usually). */
  manualCodingRatio?: number;
  /** Scale of 0 to 1 representing success rate or test pass rate. */
  successScore?: number;
  /** Subjective rating provided by the user (1-5), typical in SM-2. */
  userSelfRating?: number;
  /** Time spent on this task in minutes. */
  timeSpentMinutes?: number;
};
