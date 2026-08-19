import { CodingProblem, ProblemStatus, Difficulty } from "../types/models";

export interface CodingAnalytics {
  totalSolved: number;
  totalAttempted: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  platformsCount: Record<string, number>;
  domainsCount: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  revisionPendingCount: number;
  longestStreak: number;
  averageTimePerProblem: number; // in minutes
  mostPracticedDomain: string | null;
  weakestDomain: string | null;
  interviewReadinessScore: number; // 0 to 100
}

export class CodingAnalyticsService {
  static calculateAnalytics(problems: CodingProblem[]): CodingAnalytics {
    const solved = problems.filter(p => p.status === ProblemStatus.Solved || p.status === ProblemStatus.Revised);
    const attempted = problems.filter(p => p.status === ProblemStatus.Attempted);
    
    const easyCount = solved.filter(p => p.difficulty === Difficulty.Easy).length;
    const mediumCount = solved.filter(p => p.difficulty === Difficulty.Medium).length;
    const hardCount = solved.filter(p => p.difficulty === Difficulty.Hard).length;
    
    const platformsCount: Record<string, number> = {};
    const domainsCount: Record<string, number> = {};
    let totalTime = 0;
    
    // Confidence tracking per domain for weakest domain calculation
    const domainConfidence: Record<string, { totalScore: number, count: number }> = {};
    
    solved.forEach(p => {
      platformsCount[p.platform] = (platformsCount[p.platform] || 0) + 1;
      
      p.domains.forEach(d => {
        domainsCount[d] = (domainsCount[d] || 0) + 1;
        
        if (!domainConfidence[d]) {
          domainConfidence[d] = { totalScore: 0, count: 0 };
        }
        domainConfidence[d].totalScore += p.confidenceScore;
        domainConfidence[d].count += 1;
      });
      
      totalTime += p.timeTaken;
    });
    
    const revisionPendingCount = problems.filter(p => 
      p.needsRevision || 
      (p.revision.nextSuggestedRevision && new Date(p.revision.nextSuggestedRevision) <= new Date())
    ).length;
    
    const averageTimePerProblem = solved.length > 0 ? Math.round(totalTime / solved.length) : 0;
    
    let mostPracticedDomain = null;
    let maxDomainCount = 0;
    for (const [domain, count] of Object.entries(domainsCount)) {
      if (count > maxDomainCount) {
        maxDomainCount = count;
        mostPracticedDomain = domain;
      }
    }
    
    let weakestDomain = null;
    let minAvgConfidence = 11; // max confidence is 10
    for (const [domain, data] of Object.entries(domainConfidence)) {
      const avg = data.totalScore / data.count;
      if (avg < minAvgConfidence) {
        minAvgConfidence = avg;
        weakestDomain = domain;
      }
    }
    
    // Streak logic (basic calculation based on solved dates)
    const dates = solved
      .map(p => {
        const d = p.dateSolved ? new Date(p.dateSolved) : new Date(p.createdAt);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      })
      .sort((a, b) => a - b);
    
    const uniqueDates = Array.from(new Set(dates));
    
    let longestStreak = 0;
    let currentStreak = 0;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const diff = uniqueDates[i] - uniqueDates[i - 1];
        if (diff <= ONE_DAY) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }
    // Handle edge case where there's only 1 date
    if (uniqueDates.length === 1 && longestStreak === 0) {
      longestStreak = 1;
    }
    
    // Interview Readiness Score (mock formula based on Mediums/Hards and confidence)
    // We weight hard=3, medium=2, easy=1. Cap around 300 points for 100%.
    const scoreBase = (hardCount * 3 + mediumCount * 2 + easyCount * 1);
    // Add confidence factor: average confidence out of 10
    const avgOverallConfidence = solved.length > 0 ? (solved.reduce((sum, p) => sum + p.confidenceScore, 0) / solved.length) / 10 : 0;
    
    let readiness = (scoreBase / 300) * 100 * (0.5 + avgOverallConfidence * 0.5);
    if (readiness > 100) readiness = 100;
    if (readiness < 0) readiness = 0;

    return {
      totalSolved: solved.length,
      totalAttempted: attempted.length,
      easyCount,
      mediumCount,
      hardCount,
      platformsCount,
      domainsCount,
      difficultyDistribution: {
        Easy: easyCount,
        Medium: mediumCount,
        Hard: hardCount
      },
      revisionPendingCount,
      longestStreak,
      averageTimePerProblem,
      mostPracticedDomain,
      weakestDomain,
      interviewReadinessScore: Math.round(readiness),
    };
  }
}
