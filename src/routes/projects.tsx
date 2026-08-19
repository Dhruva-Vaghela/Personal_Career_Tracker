import React, { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GitBranch, Rocket, CheckCircle2, Circle, Github, FolderGit2, BookOpen, ExternalLink, Code2 } from "lucide-react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { Checkbox } from "@/components/ui/checkbox";
import { useGithubAuth } from "@/features/github/hooks/use-github-auth";
import { useGithubDashboard } from "@/features/github/hooks/use-github-data";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { InterviewReviewDialog } from "@/features/projects/components/interview-review-dialog";
import type { Project } from "@/features/projects/types";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Portfolio · Engineering OS" },
      { name: "description", content: "Professional engineering portfolio and interview workspace." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const manualProjects = useAppStore(state => state.projects);
  const updateProject = useAppStore(state => state.updateProject);

  const { token, user } = useGithubAuth();
  const { repos, isLoading: isGithubLoading } = useGithubDashboard(token, user);

  const combinedProjects = useMemo(() => {
    const githubProjects: Project[] = repos.map((repo) => ({
      id: `github-${repo.id}`,
      source: "GITHUB",
      title: repo.name,
      description: repo.description || "No description provided.",
      category: "Open Source",
      status: "Completed",
      technologies: repo.language ? [repo.language] : [],
      githubUrl: repo.html_url,
      githubRepoId: repo.id,
      createdAt: repo.created_at || repo.updated_at,
      updatedAt: repo.pushed_at || repo.updated_at,
    }));

    // Sort by updated at descending
    return [...manualProjects, ...githubProjects].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [manualProjects, repos]);

  // --- Analytics ---
  const totalProjects = combinedProjects.length;
  const githubCount = combinedProjects.filter(p => p.source === "GITHUB").length;
  const manualCount = combinedProjects.filter(p => p.source === "MANUAL").length;
  const completedCount = combinedProjects.filter(p => p.status === "Completed").length;
  const completionRate = totalProjects ? Math.round((completedCount / totalProjects) * 100) : 0;
  
  const techSet = new Set<string>();
  combinedProjects.forEach(p => p.technologies.forEach(t => techSet.add(t)));
  const totalTech = techSet.size;

  const aiProjects = combinedProjects.filter(p => 
    p.technologies.some(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("ml") || t.toLowerCase().includes("python")) ||
    p.description.toLowerCase().includes("ai ") || p.description.toLowerCase().includes("machine learning")
  ).length;

  const backendProjects = combinedProjects.filter(p => 
    p.technologies.some(t => ["node.js", "express", "go", "rust", "java", "python", "nestjs"].includes(t.toLowerCase())) ||
    p.description.toLowerCase().includes("api") || p.description.toLowerCase().includes("backend")
  ).length;

  return (
    <>
      <PageHeader 
        eyebrow="Portfolio & Reviews" 
        title="Projects" 
        description="Your professional engineering portfolio and interview preparation workspace." 
        actions={<CreateProjectDialog />}
      />
      <PageBody>
        
        {/* Analytics Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Panel className="!p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <FolderGit2 className="h-4 w-4" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Total Projects</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
              <span>{githubCount} GitHub</span>
              <span>•</span>
              <span>{manualCount} Manual</span>
            </div>
          </Panel>
          <Panel className="!p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Completion</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">{completedCount} projects shipped</p>
          </Panel>
          <Panel className="!p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Code2 className="h-4 w-4" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Tech Stack</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalTech}</p>
            <p className="mt-1 text-xs text-muted-foreground">Unique technologies used</p>
          </Panel>
          <Panel className="!p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <h3 className="text-xs font-medium uppercase tracking-wider">Focus Areas</h3>
            </div>
            <div className="flex flex-col gap-1 mt-1 text-xs font-medium text-foreground">
              <div className="flex justify-between"><span>Backend</span><span>{backendProjects}</span></div>
              <div className="flex justify-between"><span>AI / ML</span><span>{aiProjects}</span></div>
            </div>
          </Panel>
        </div>

        {combinedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/50 rounded-lg bg-background/20 space-y-4">
            {isGithubLoading ? (
              <p className="text-[13px] text-muted-foreground animate-pulse">Syncing repositories...</p>
            ) : (
              <>
                <p className="text-[13px] text-muted-foreground">No projects found in your portfolio.</p>
                <CreateProjectDialog />
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {combinedProjects.map((p) => {
              const isCompleted = p.status === "Completed" || p.status === "Archived" || p.status === "Maintained";
              return (
                <Panel key={p.id} className="!p-5 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {p.source === "GITHUB" ? (
                            <Github className="h-4 w-4 text-foreground" />
                          ) : (
                            <Rocket className="h-4 w-4 text-primary" />
                          )}
                          <h3 className="font-mono text-[14px] font-semibold line-clamp-1" title={p.title}>{p.title}</h3>
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                      <Badge variant={isCompleted ? "default" : "secondary"} className="shrink-0 rounded-md">
                        {p.status}
                      </Badge>
                    </div>

                    {p.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.technologies.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted/50 border border-border/50 text-muted-foreground font-medium">
                            {t}
                          </span>
                        ))}
                        {p.technologies.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted/50 border border-border/50 text-muted-foreground font-medium">
                            +{p.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 border-t border-border/50 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {p.source === "MANUAL" ? (
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={p.id}
                            checked={isCompleted}
                            onCheckedChange={(c) => updateProject(p.id, { status: c ? "Completed" : "In Progress" })}
                          />
                          <label 
                            htmlFor={p.id}
                            className={`text-[12px] cursor-pointer ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}
                          >
                            Completed
                          </label>
                        </div>
                      ) : (
                        <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                          <Github className="h-3.5 w-3.5" /> Repository
                        </a>
                      )}
                      
                      {p.liveLink && (
                        <a href={p.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> Live
                        </a>
                      )}
                    </div>

                    <InterviewReviewDialog project={p} />
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}