import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/app-shell";
import { FolderOpen, Star, AlertCircle, Sparkles, Briefcase, Code2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { InterviewReviewDialog } from "@/features/projects/components/interview-review-dialog";
import { Panel } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewStudio } from "@/features/career-guide/components/interview-studio";
import { CodeReviewStudio } from "@/features/career-guide/components/code-review-studio";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Interview Prep & Assessment Studio · Engineering OS" },
      { name: "description", content: "Interactive AI Technical Interviewer, follow-up questions, and code review." },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const projects = useAppStore((state) => state.projects);
  const projectReviews = useAppStore((state) => state.projectReviews);

  const reviewedProjects = projects.filter((p) => projectReviews[p.id]);
  const unreviewedProjects = projects.filter((p) => !projectReviews[p.id]);

  const renderRatingBadge = (rating: string) => {
    const variants: Record<string, string> = {
      Beginner: "bg-red-500/10 text-red-500 border-red-500/20",
      Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Strong: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Excellent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return <Badge className={variants[rating] || "bg-muted"} variant="outline">{rating}</Badge>;
  };

  return (
    <>
      <PageHeader
        eyebrow="Loop-ready"
        title="Interview Preparation & Assessment Studio"
        description="Practice with an AI Staff Technical Interviewer, evaluate AI-generated code, and review portfolio projects."
      />
      <PageBody>
        <Tabs defaultValue="ai-interviewer" className="w-full space-y-6">
          <TabsList className="grid grid-cols-3 max-w-xl bg-secondary/30 p-1 rounded-lg">
            <TabsTrigger value="ai-interviewer" className="text-xs flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              AI Technical Interviewer
            </TabsTrigger>
            <TabsTrigger value="code-review" className="text-xs flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              Code Review Studio
            </TabsTrigger>
            <TabsTrigger value="portfolio-reviews" className="text-xs flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Portfolio Reviews
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AI Technical Interviewer with Follow-up Questions */}
          <TabsContent value="ai-interviewer" className="space-y-6">
            <InterviewStudio />
          </TabsContent>

          {/* TAB 2: Code Review Studio (Submit Code + Flawed Code Review Assessment) */}
          <TabsContent value="code-review" className="space-y-6">
            <CodeReviewStudio />
          </TabsContent>

          {/* TAB 3: Project Portfolio Reviews */}
          <TabsContent value="portfolio-reviews" className="space-y-6">
            <Panel title="Project Portfolio Reviews">
              <div className="space-y-6 mt-4">
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/20">
                    <FolderOpen className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-[13px]">No projects added to your portfolio yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reviewedProjects.map((p) => {
                      const review = projectReviews[p.id];
                      return (
                        <div key={p.id} className="p-4 rounded-lg bg-card border border-border shadow-sm flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">{p.title}</h4>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xs text-muted-foreground">Overall Rating:</span>
                              {renderRatingBadge(review.overallRating)}
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Star className="h-3 w-3 text-emerald-500" />
                                <span className="truncate">{review.strengths[0]}</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="truncate">{review.weaknesses[0]}</span>
                              </div>
                            </div>
                          </div>
                          <InterviewReviewDialog project={p} trigger={
                            <button className="text-xs w-full py-1.5 rounded bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 font-medium transition-colors flex items-center justify-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              View Full Review
                            </button>
                          } />
                        </div>
                      );
                    })}
                    
                    {unreviewedProjects.map((p) => (
                      <div key={p.id} className="p-4 rounded-lg bg-background/50 border border-dashed border-border/50 flex flex-col items-center justify-center text-center">
                        <h4 className="font-semibold text-sm mb-2">{p.title}</h4>
                        <p className="text-xs text-muted-foreground mb-4">No review generated yet.</p>
                        <InterviewReviewDialog project={p} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}