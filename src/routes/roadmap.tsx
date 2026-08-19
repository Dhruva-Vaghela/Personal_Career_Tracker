import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  Play,
  ChevronRight,
  Settings,
  BookOpen,
  Clock,
  Tag,
  Award,
  Sparkles,
  Zap,
  Target,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLearningEngine } from "@/features/learning/hooks/use-learning-engine";
import { useAppStore } from "@/store/app-store";
import type { EngineChecklistItem, EngineSubtopic, EngineTopic, EngineModule } from "@/features/learning/types";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import careerCurriculum from "@/data/career-curriculum.json";
import { TopicStudio } from "@/features/career-guide/components/topic-studio";
import { calculateCareerReadiness } from "@/features/career-guide/services/mastery-engine";
import type { CareerTopic } from "@/features/career-guide/types";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Career Guide & Roadmap · Engineering OS" },
      {
        name: "description",
        content: "Complete 12-Module curriculum with Gemini Assessment Engine and Career Readiness platform.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const [viewMode, setViewMode] = useState<"career-guide" | "legacy-roadmap">("career-guide");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod-1");
  const [selectedTopic, setSelectedTopic] = useState<CareerTopic | null>(null);

  const topicMasteries = useAppStore((s) => s.topicMasteries);
  const projects = useAppStore((s) => s.projects);
  const completedCareerSubtopics = useAppStore((s) => s.completedCareerSubtopics);

  const readiness = calculateCareerReadiness(topicMasteries, projects.length);

  const activeModule = careerCurriculum.modules.find((m) => m.id === selectedModuleId) || careerCurriculum.modules[0];

  return (
    <>
      <PageHeader
        eyebrow="AI-Augmented Engineering Platform"
        title="Career Guide & Assessment Engine"
        description="12-Module curriculum: Learn → Practice → Quiz → Assess → Apply → Review → Master → Career Readiness."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-secondary/40 p-1 rounded-lg border border-border/50 text-xs">
              <button
                onClick={() => { setViewMode("career-guide"); setSelectedTopic(null); }}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors",
                  viewMode === "career-guide" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                12-Module Curriculum
              </button>
              <button
                onClick={() => setViewMode("legacy-roadmap")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors",
                  viewMode === "legacy-roadmap" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Phased Roadmap
              </button>
            </div>

            <div className="bg-background/60 border border-border/60 p-2.5 rounded-lg text-right hidden sm:block">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Career Readiness</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-primary">{readiness.overallPercentage}%</span>
                <Badge variant="default" className="text-[10px] uppercase">
                  {readiness.readinessLabel}
                </Badge>
              </div>
            </div>
          </div>
        }
      />

      <PageBody>
        {selectedTopic ? (
          /* Active Topic Studio */
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTopic(null)}
              className="gap-2 text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Curriculum Overview
            </Button>
            <TopicStudio topic={selectedTopic} />
          </div>
        ) : viewMode === "career-guide" ? (
          /* 12-Module Career Guide View */
          <div className="space-y-6">
            {/* Career Readiness Scorecard Banner */}
            <div className="surface-panel p-6 glow-primary rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-lg font-bold">Overall Engineering Career Readiness</h3>
                  <p className="text-xs text-muted-foreground">
                    Deterministic evaluation across 7 core surfaces. Current Status: <strong className="text-primary">{readiness.readinessLabel}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={readiness.overallPercentage} className="w-36 h-2.5" />
                  <span className="font-mono text-xl font-bold text-primary">{readiness.overallPercentage}%</span>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 text-center">
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">Foundations</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.fundamentalsScore}%</div>
                </div>
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">DSA & Algo</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.problemSolvingScore}%</div>
                </div>
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">Tech Skills</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.technicalSkillsScore}%</div>
                </div>
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">Projects</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.projectsScore}%</div>
                </div>
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">Software Eng</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.softwareEngineeringScore}%</div>
                </div>
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">AI Eng</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.aiEngineeringScore}%</div>
                </div>
                <div className="p-2.5 bg-secondary/30 rounded-lg">
                  <div className="text-[10px] text-muted-foreground">Interview Prep</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{readiness.interviewReadinessScore}%</div>
                </div>
              </div>
            </div>

            {/* 12-Module Navigation Grid */}
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                  12 Career Modules
                </div>
                {careerCurriculum.modules.map((mod) => {
                  const isActive = mod.id === activeModule.id;
                  const topicCount = mod.topics.length;
                  const masteredCount = mod.topics.filter(
                    (t) => topicMasteries[t.id]?.status === "Mastered"
                  ).length;
                  const modPercent = topicCount > 0 ? Math.round((masteredCount / topicCount) * 100) : 0;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "border-border bg-secondary/70 text-foreground font-semibold"
                          : "hover:border-border hover:bg-secondary/30 text-muted-foreground"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-primary">M{mod.number}</span>
                          <span className="truncate text-xs">{mod.title}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={modPercent} className="h-1 flex-1" />
                          <span className="font-mono text-[10px] text-muted-foreground">{modPercent}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-60 ml-2" />
                    </button>
                  );
                })}
              </div>

              {/* Module Topics & Studio Entry */}
              <div className="space-y-6">
                <div className="surface-panel p-6 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="text-xs font-mono uppercase text-primary border-primary/30">
                        Module {activeModule.number} · {activeModule.category}
                      </Badge>
                      <h3 className="text-xl font-bold mt-1">{activeModule.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{activeModule.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {activeModule.topics.map((tp) => {
                    const tm = topicMasteries[tp.id] || {
                      masteryPercentage: 0,
                      status: "Not Started",
                    };

                    const completedSubCount = tp.subtopics.filter((s) => completedCareerSubtopics[s.id]).length;

                    return (
                      <div
                        key={tp.id}
                        onClick={() => setSelectedTopic(tp)}
                        className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer space-y-4 group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                            {tp.title}
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <Badge variant={tm.status === "Mastered" ? "default" : "secondary"} className="text-[10px] capitalize">
                            {tm.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{tp.description}</p>

                        <div className="space-y-1.5 border-t border-border/50 pt-3">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Subtopics ({completedSubCount}/{tp.subtopics.length})</span>
                            <span className="font-mono text-primary font-bold">{tm.masteryPercentage}% Mastery</span>
                          </div>
                          <Progress value={tm.masteryPercentage} className="h-1.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Legacy Phased Roadmap Engine */
          <LegacyRoadmapView />
        )}
      </PageBody>
    </>
  );
}

function LegacyRoadmapView() {
  const { data: learningEngine, isError } = useLearningEngine();
  const [selectedId, setSelectedId] = useState<string>();
  
  const selected =
    learningEngine?.phases.find((phase) => phase.id === selectedId) ??
    learningEngine?.phases.find((phase) => phase.isUnlocked && !phase.progress.isCompleted) ??
    learningEngine?.phases[0];

  if (isError || !learningEngine || !selected) {
    return <div className="p-6 text-center text-xs text-muted-foreground">Loading Phased Roadmap...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-1">
        {learningEngine.phases.map((phase, index) => {
          const active = phase.id === selected.id;
          return (
            <button
              key={phase.id}
              onClick={() => setSelectedId(phase.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition",
                active
                  ? "border-border bg-secondary/60"
                  : "hover:border-border hover:bg-secondary/30",
              )}
            >
              <StatusDot progress={phase.progress} isUnlocked={phase.isUnlocked} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    P{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[13px] font-medium">{phase.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={phase.progress.completionPercentage} className="h-1 flex-1" />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {phase.progress.completionPercentage}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="surface-panel p-6 glow-primary">
        <h2 className="text-xl font-bold">{selected.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
      </div>
    </div>
  );
}

function StatusDot({ progress, isUnlocked }: { progress: { isCompleted: boolean }; isUnlocked?: boolean }) {
  if (progress.isCompleted) return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (isUnlocked) return <Play className="h-4 w-4 text-primary" />;
  return <Circle className="h-4 w-4 text-muted-foreground/50" />;
}
