import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/app-store";
import { interviewReviewService } from "../services/interview-review.service";
import type { Project, InterviewReview } from "../types";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface InterviewReviewDialogProps {
  project: Project;
  trigger?: React.ReactNode;
}

export function InterviewReviewDialog({ project, trigger }: InterviewReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const projectReviews = useAppStore((state) => state.projectReviews);
  const addProjectReview = useAppStore((state) => state.addProjectReview);
  
  const existingReview = projectReviews[project.id];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const review = await interviewReviewService.generateReview(project);
      addProjectReview(review);
      toast.success("Interview review generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate interview review.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRatingBadge = (rating: InterviewReview["overallRating"]) => {
    const variants: Record<string, string> = {
      Beginner: "bg-red-500/10 text-red-500 border-red-500/20",
      Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Strong: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Excellent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return <Badge className={variants[rating]} variant="outline">{rating}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Interview Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Staff Engineer Review
              </DialogTitle>
              <DialogDescription className="mt-1">
                AI evaluation of <strong>{project.title}</strong> from an interviewer's perspective.
              </DialogDescription>
            </div>
            {existingReview && !isGenerating && (
              <Button variant="ghost" size="sm" onClick={handleGenerate} className="gap-2 h-8 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-[400px]">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <div className="text-center">
                <p className="font-medium text-foreground">Analyzing architecture and code...</p>
                <p className="text-sm mt-1">Simulating a staff engineering interview evaluation.</p>
              </div>
            </div>
          ) : !existingReview ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-medium text-foreground mb-2">Generate Interview Feedback</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Get actionable feedback on technical depth, architecture, and how to position this project on your resume and in interviews.
                </p>
                <Button onClick={handleGenerate} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                  <Sparkles className="h-4 w-4" />
                  Analyze Project
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-6 pb-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Overall Rating</p>
                    <p className="text-xs text-muted-foreground">Based on scope, architecture, and impact.</p>
                  </div>
                  {renderRatingBadge(existingReview.overallRating)}
                </div>

                {existingReview.evaluations && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                      Core Competencies
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(existingReview.evaluations).map(([key, rating]) => (
                        <div key={key} className="flex flex-col gap-1 p-3 rounded bg-card border border-border shadow-sm">
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div>{renderRatingBadge(rating as InterviewReview["overallRating"])}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {existingReview.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <AlertCircle className="h-4 w-4 text-red-500" /> Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {existingReview.weaknesses.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                    Resume & Portfolio Positioning
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resume Bullets</p>
                      <ul className="space-y-2">
                        {existingReview.resumeSuggestions.map((s, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="shrink-0 text-muted-foreground mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Portfolio Narrative</p>
                      <ul className="space-y-2">
                        {existingReview.portfolioSuggestions.map((s, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="shrink-0 text-muted-foreground mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
                    Interview Preparation
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Likely Questions</p>
                      <ul className="space-y-2">
                        {existingReview.likelyInterviewQuestions.map((s, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2 bg-muted/30 p-2 rounded">
                            <span className="font-medium text-purple-500 mr-1">Q:</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Deep-Dive Follow-ups</p>
                      <ul className="space-y-2">
                        {existingReview.likelyFollowUpQuestions.map((s, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2 bg-muted/30 p-2 rounded">
                            <span className="font-medium text-blue-500 mr-1">Q:</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-border/50">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Suggested Improvements</h4>
                    <ul className="space-y-2">
                      {existingReview.suggestedImprovements.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Missing Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {existingReview.missingConcepts.map((c, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="text-sm font-semibold text-primary mb-1">Hiring Readiness</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{existingReview.hiringReadiness}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
