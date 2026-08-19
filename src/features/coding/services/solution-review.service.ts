import { AIReview } from "../types/models";

export class SolutionReviewService {
  /**
   * Generates a detailed 12-section technical interview code review.
   */
  static async generateReview(code: string, language: string, title: string): Promise<AIReview> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      correctness: {
        isCorrect: true,
        handlesEdgeCases: false,
        logicalMistakes: [
          "Fails to handle an empty array input correctly."
        ]
      },
      timeComplexity: {
        exactTC: "O(N^2)",
        explanation: "Contains a nested loop iterating over the input array.",
        optimalTC: "O(N)",
        isOptimal: false
      },
      spaceComplexity: {
        exactSC: "O(1)",
        explanation: "Only a few primitive variables are used for tracking state.",
        optimalSC: "O(N)"
      },
      codeStrengthRating: "Fair",
      ratingJustification: "The code solves the base problem but is inefficient and lacks proper edge case handling. The logic is understandable but naming conventions need work.",
      interviewEvaluation: {
        wouldPass: false,
        interviewReadinessScore: 65,
        difficultyHandled: "Easy",
        followUpQuestions: [
          "How would you optimize this to run in O(N) time?",
          "What happens if the input size exceeds memory limits?"
        ],
        prerequisiteConcepts: ["Hash Maps", "Two-pointer technique"]
      },
      optimizationReview: {
        betterAlgorithms: ["Use a Hash Map to store previously seen elements"],
        betterDataStructures: ["Hash Map / Dictionary"],
        whyOptimalIsBetter: "It reduces the time complexity from quadratic to linear by trading some space.",
        tradeOffs: "The optimal solution uses O(N) space instead of O(1) space, but the massive speed increase justifies this trade-off in almost all practical scenarios."
      },
      codeQuality: {
        namingConventions: "Variable names like 'x' and 'y' are not descriptive.",
        readability: "Okay, but could benefit from clearer variable names and comments.",
        functionDesign: "Adequate, but could be broken into smaller helpers if it grows.",
        modularity: "Monolithic logic inside a single function.",
        bestPractices: ["Avoid magic numbers", "Use strict equality"],
        cleanCodePrinciples: ["Meaningful Names", "Single Responsibility"]
      },
      edgeCaseAnalysis: {
        missingEdgeCases: ["Empty input array", "Array with all negative numbers"],
        possibleBugs: ["Index out of bounds if length is 0"],
        overflowIssues: ["Potential integer overflow if summing large numbers"],
        boundaryConditions: ["Checking the last element properly"],
        invalidInputHandling: "No null or undefined checks present."
      },
      learningFeedback: {
        biggestStrength: "Good understanding of the brute force approach.",
        biggestWeakness: "Not considering space-time tradeoffs to optimize the algorithm.",
        mistakesToAvoid: ["Using nested loops for simple lookups"],
        topicsToRevise: ["Hash Maps", "Time Complexity Analysis"],
        recommendedNextDifficulty: "Medium",
        recommendedDomains: ["Hashing", "Arrays"]
      },
      overallEvaluation: {
        overallScore: 60,
        confidenceScore: 5,
        hiringReadiness: "Not ready for top-tier companies, but close for entry-level.",
        estimatedPerformance: "Pass for Junior, Reject for Mid-level"
      },
      comparison: {
        myTC: "O(N^2)",
        optTC: "O(N)",
        mySC: "O(1)",
        optSC: "O(N)",
        requiredImprovements: "Implement a hash map to achieve single-pass O(N) lookup."
      },
      generatedAt: new Date().toISOString()
    };
  }
}
