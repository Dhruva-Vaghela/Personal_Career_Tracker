import { AIReview, CodeStrengthRating } from "../../types/models";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Target, Lightbulb, Activity, FileCode2, GraduationCap, LayoutList, Bug, ShieldCheck, Scale } from "lucide-react";

interface AIReviewDisplayProps {
  review: AIReview;
}

export function AIReviewDisplay({ review }: AIReviewDisplayProps) {
  const renderCodeStrength = (rating: CodeStrengthRating) => {
    let colorClass = "text-gray-500 border-gray-500/30 bg-gray-500/10";
    if (rating === "Excellent" || rating === "Strong") colorClass = "text-green-500 border-green-500/30 bg-green-500/10";
    if (rating === "Good" || rating === "Fair") colorClass = "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    if (rating === "Poor") colorClass = "text-red-500 border-red-500/30 bg-red-500/10";
    
    return (
      <Badge variant="outline" className={`text-sm py-1 px-3 ${colorClass}`}>
        {rating}
      </Badge>
    );
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Overview Card */}
      <div className="bg-card border rounded-lg p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Overall Evaluation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Score: <span className={`font-bold ${getReadinessColor(review.overallEvaluation.overallScore)}`}>{review.overallEvaluation.overallScore}/100</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Code Strength</p>
            {renderCodeStrength(review.codeStrengthRating)}
          </div>
        </div>
        <p className="text-sm mb-4">{review.ratingJustification}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/30 rounded-md">
            <span className="text-xs text-muted-foreground block mb-1">Hiring Readiness</span>
            <span className="text-xs font-medium">{review.overallEvaluation.hiringReadiness}</span>
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            <span className="text-xs text-muted-foreground block mb-1">Est. Performance</span>
            <span className="text-xs font-medium">{review.overallEvaluation.estimatedPerformance}</span>
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            <span className="text-xs text-muted-foreground block mb-1">Confidence Score</span>
            <span className="text-xs font-medium">{review.overallEvaluation.confidenceScore}/10</span>
          </div>
          <div className="p-3 bg-muted/30 rounded-md">
            <span className="text-xs text-muted-foreground block mb-1">Difficulty Handled</span>
            <span className="text-xs font-medium">{review.interviewEvaluation.difficultyHandled}</span>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        
        {/* 1. Correctness & Edge Cases */}
        <AccordionItem value="correctness" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm">Correctness & Edge Cases</span>
              {review.correctness.isCorrect ? 
                <Badge variant="outline" className="ml-2 text-green-500 border-green-500/30 text-[10px]">Pass</Badge> : 
                <Badge variant="outline" className="ml-2 text-red-500 border-red-500/30 text-[10px]">Fail</Badge>
              }
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 text-sm">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Validation
                </h4>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center bg-muted/30 p-2 rounded">
                    <span>Core Logic Correct</span>
                    <span>{review.correctness.isCorrect ? "Yes" : "No"}</span>
                  </li>
                  <li className="flex justify-between items-center bg-muted/30 p-2 rounded">
                    <span>Handles Edge Cases</span>
                    <span>{review.correctness.handlesEdgeCases ? "Yes" : "No"}</span>
                  </li>
                  <li className="flex justify-between items-center bg-muted/30 p-2 rounded">
                    <span>Missing Edge Cases</span>
                    <span className="font-medium text-xs text-right max-w-[150px]">{review.edgeCaseAnalysis.missingEdgeCases.length} missed</span>
                  </li>
                </ul>
              </div>
              
              <div>
                {(review.correctness.logicalMistakes.length > 0 || review.edgeCaseAnalysis.possibleBugs.length > 0) && (
                  <>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-500">
                      <Bug className="h-4 w-4" /> Issues Identified
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {review.correctness.logicalMistakes.map((m, i) => <li key={i}>{m}</li>)}
                      {review.edgeCaseAnalysis.possibleBugs.map((m, i) => <li key={i}>{m}</li>)}
                      {review.edgeCaseAnalysis.missingEdgeCases.map((m, i) => <li key={`ec-${i}`}>Missed edge case: {m}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Complexity Analysis */}
        <AccordionItem value="complexity" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm">Complexity Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 text-sm">
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              {/* Time Complexity */}
              <div className="p-4 border rounded-md relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${review.timeComplexity.isOptimal ? "bg-green-500" : "bg-yellow-500"}`}></div>
                <h4 className="font-semibold mb-3">Time Complexity</h4>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">Your Solution:</span>
                  <Badge variant="outline" className="font-mono">{review.timeComplexity.exactTC}</Badge>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">Optimal:</span>
                  <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/30">{review.timeComplexity.optimalTC}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{review.timeComplexity.explanation}</p>
              </div>

              {/* Space Complexity */}
              <div className="p-4 border rounded-md relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-blue-500`}></div>
                <h4 className="font-semibold mb-3">Space Complexity</h4>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">Your Solution:</span>
                  <Badge variant="outline" className="font-mono">{review.spaceComplexity.exactSC}</Badge>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">Optimal:</span>
                  <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/30">{review.spaceComplexity.optimalSC}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{review.spaceComplexity.explanation}</p>
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-md">
              <span className="text-xs font-semibold block mb-1">Required Improvements:</span>
              <p className="text-xs text-muted-foreground">{review.comparison.requiredImprovements}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Optimization Review */}
        <AccordionItem value="optimization" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-sm">Optimization & Trade-offs</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 text-sm">
            <div className="space-y-4">
              {review.optimizationReview.betterAlgorithms.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-1">Better Algorithms</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.optimizationReview.betterAlgorithms.map((algo, i) => (
                      <Badge key={i} variant="secondary" className="font-normal">{algo}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {review.optimizationReview.betterDataStructures.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-1">Better Data Structures</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.optimizationReview.betterDataStructures.map((ds, i) => (
                      <Badge key={i} variant="secondary" className="font-normal">{ds}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-3 rounded border">
                  <h4 className="text-xs font-semibold mb-1">Why Optimal is Better</h4>
                  <p className="text-xs text-muted-foreground">{review.optimizationReview.whyOptimalIsBetter}</p>
                </div>
                <div className="bg-muted/20 p-3 rounded border">
                  <h4 className="text-xs font-semibold mb-1">Trade-offs</h4>
                  <p className="text-xs text-muted-foreground">{review.optimizationReview.tradeOffs}</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Code Quality */}
        <AccordionItem value="codequality" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Code Quality & Best Practices</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 text-sm">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Naming Conventions</span>
                <p className="text-xs mt-1">{review.codeQuality.namingConventions}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Readability</span>
                <p className="text-xs mt-1">{review.codeQuality.readability}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Modularity</span>
                <p className="text-xs mt-1">{review.codeQuality.modularity}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Function Design</span>
                <p className="text-xs mt-1">{review.codeQuality.functionDesign}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold mb-2 block">Applied Clean Code Principles</span>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {review.codeQuality.cleanCodePrinciples.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <span className="text-xs font-semibold mb-2 block">Best Practices</span>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {review.codeQuality.bestPractices.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Interview Evaluation */}
        <AccordionItem value="interview" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <LayoutList className="h-4 w-4 text-primary" />
              <span className="text-sm">Interview Evaluation</span>
              {review.interviewEvaluation.wouldPass ? 
                <Badge variant="outline" className="ml-2 text-green-500 border-green-500/30 text-[10px]">Pass</Badge> : 
                <Badge variant="outline" className="ml-2 text-red-500 border-red-500/30 text-[10px]">Reject</Badge>
              }
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 text-sm">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-500"/> Likely Follow-up Questions</h4>
                <ul className="space-y-1">
                  {review.interviewEvaluation.followUpQuestions.map((q, i) => (
                    <li key={i} className="text-xs p-2 bg-muted/20 rounded border">{q}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold mb-2">Prerequisite Concepts to Explain</h4>
                <div className="flex flex-wrap gap-2">
                  {review.interviewEvaluation.prerequisiteConcepts.map((c, i) => (
                    <Badge key={i} variant="outline" className="font-normal">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Learning Feedback */}
        <AccordionItem value="learning" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm">Learning Feedback</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 text-sm">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 border border-green-500/20 bg-green-500/5 rounded-md">
                <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Biggest Strength</h4>
                <p className="text-xs">{review.learningFeedback.biggestStrength}</p>
              </div>
              <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-md">
                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Biggest Weakness</h4>
                <p className="text-xs">{review.learningFeedback.biggestWeakness}</p>
              </div>
            </div>

            <div className="space-y-4">
              {review.learningFeedback.mistakesToAvoid.length > 0 && (
                <div>
                  <span className="text-xs font-semibold mb-2 block">Mistakes to Avoid Next Time</span>
                  <ul className="list-disc list-inside text-xs text-muted-foreground">
                    {review.learningFeedback.mistakesToAvoid.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="bg-muted/20 p-4 rounded-md">
                <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" /> Actionable Recommendations
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs border-b pb-2">
                    <span className="text-muted-foreground">Recommended Next Difficulty:</span>
                    <Badge variant="outline">{review.learningFeedback.recommendedNextDifficulty}</Badge>
                  </div>
                  <div className="flex items-start justify-between text-xs pt-1">
                    <span className="text-muted-foreground mt-1">Recommended Domains:</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {review.learningFeedback.recommendedDomains.map((d, i) => (
                        <Badge key={i} variant="secondary" className="font-normal text-[10px]">{d}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start justify-between text-xs pt-2">
                    <span className="text-muted-foreground mt-1">Topics to Revise:</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {review.learningFeedback.topicsToRevise.map((t, i) => (
                        <Badge key={i} variant="outline" className="font-normal text-[10px] border-primary/30 text-primary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
