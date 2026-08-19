import { createFileRoute } from "@tanstack/react-router";
import { Target, Clock, Zap, CheckCircle2, Circle, Loader2, BookOpen } from "lucide-react";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/app-store";
import { generateMissionServerFn } from "@/features/ai-mentor/mission.server";
import { useGithubAuth } from "@/features/github/hooks/use-github-auth";
import { useGithubDashboard } from "@/features/github/hooks/use-github-data";
import careerCurriculum from "@/data/career-curriculum.json";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Today's Mission · Engineering OS" },
      { name: "description", content: "Personalized daily engineering mission based on the 12-Module Career Guide." },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  const { token, user } = useGithubAuth();
  const githubData = useGithubDashboard(token, user);
  
  const { 
    todaysMission, 
    missionChecklistProgress, 
    toggleMissionChecklistItem,
    setTodaysMission,
    completeMission,
    skipMission,
    topicMasteries,
    projects,
    learningStreak,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMission = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Find active module & topic in the 12-Module Career Curriculum
      let activeModule = careerCurriculum.modules[0];
      let activeTopic = activeModule.topics[0];
      const weakSkills: { name: string; score: number }[] = [];

      for (const mod of careerCurriculum.modules) {
        for (const top of mod.topics) {
          const tm = topicMasteries[top.id];
          if (!tm || tm.status !== "Mastered") {
            if (activeModule.id === careerCurriculum.modules[0].id && activeTopic.id === activeModule.topics[0].id) {
              activeModule = mod;
              activeTopic = top;
            }
          }
          if (tm && tm.masteryPercentage < 80) {
            weakSkills.push({ name: `${mod.title} → ${top.title}`, score: tm.masteryPercentage });
          }
        }
      }

      const res = await generateMissionServerFn({
        data: {
          availableStudyTimeMinutes: 90,
          weakestSkills: weakSkills,
          currentPhase: {
            name: `Module ${activeModule.number}: ${activeModule.title} (${activeTopic.title})`,
            description: activeTopic.description,
          },
          unfinishedProjects: projects.filter(p => p.status !== "Completed").map(p => ({ name: p.title, progress: p.status === "In Progress" ? 50 : 25 })),
          revisionSchedule: weakSkills.map(w => ({ topic: w.name, priority: 100 - w.score })),
          githubActivity: {
            recentCommitsCount: githubData.contributions?.totalContributions || 0,
            activeRepos: [],
          },
          learningStreakDays: learningStreak.currentStreak,
        },
      });

      setTodaysMission(res.recommendations.todaysMission);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate mission. Ensure API key is configured.");
    } finally {
      setIsGenerating(false);
    }
  };

  const checklistItems = todaysMission?.checklist || [];
  const completedCount = checklistItems.filter(item => missionChecklistProgress[item]).length;

  if (!todaysMission) {
    return (
      <>
        <PageHeader
          eyebrow="AI Mentor"
          title="Ready for your next mission?"
          description="Generate a personalized mission based on your active 12-Module Career Guide topic and weaknesses."
        />
        <PageBody>
          <div className="surface-panel flex flex-col items-center justify-center p-12 text-center">
            <Target className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="mb-2 text-lg font-semibold">No active mission</h3>
            <p className="mb-6 max-w-md text-[13px] text-muted-foreground">
              Your AI Mentor will analyze your active 12-Module Career Guide progress, identified topic weaknesses, and GitHub activity to craft today's mission.
            </p>
            {error && (
              <div className="mb-6 rounded-md bg-destructive/10 px-4 py-2 text-[12px] text-destructive max-w-md">
                {error}
              </div>
            )}
            <Button onClick={handleGenerateMission} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isGenerating ? "Analyzing 12-Module context..." : "Generate Today's Mission"}
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Focus block"
        title="Today's Mission"
        description="A single deliberate task designed to compound your growth."
        actions={
          <>
            <Button variant="secondary" size="sm" className="gap-1.5" onClick={skipMission}>
              <Clock className="h-3.5 w-3.5" /> Skip today
            </Button>
            <Button 
              size="sm" 
              className="gap-1.5" 
              onClick={completeMission}
              disabled={completedCount < checklistItems.length}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> 
              {completedCount < checklistItems.length ? "Finish checklist first" : "Mark complete"}
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="surface-panel glow-primary p-6">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-primary/80">
                <Target className="h-3.5 w-3.5" /> 12-Module Career Mission
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {todaysMission.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                {todaysMission.description}
              </p>
            </div>

            <Panel title="Checklist" action={<span className="text-[11px] text-muted-foreground">{completedCount} / {checklistItems.length}</span>}>
              <ul className="space-y-2">
                {checklistItems.map((text) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 rounded-md border border-border bg-background/40 px-3 py-2.5 text-[13px]"
                  >
                    <Checkbox
                      id={text}
                      checked={!!missionChecklistProgress[text]}
                      onCheckedChange={() => toggleMissionChecklistItem(text)}
                      className="mt-0.5"
                    />
                    <label 
                      htmlFor={text}
                      className={`flex-1 cursor-pointer ${missionChecklistProgress[text] ? "text-muted-foreground line-through" : ""}`}
                    >
                      {text}
                    </label>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Why this mission?">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {todaysMission.reason}
              </p>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Estimated budget">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="font-mono text-lg font-semibold">{todaysMission.estimatedTimeMinutes}m</div>
                  <div className="text-[11px] text-muted-foreground">Duration</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-semibold flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">Focus Target</div>
                </div>
              </div>
            </Panel>
            
            <Panel title="Need a new mission?">
              <p className="text-[12px] text-muted-foreground mb-3">
                If this mission doesn't fit your schedule today, you can ask your AI mentor to generate a new one.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[12px]"
                onClick={handleGenerateMission}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                Regenerate Mission
              </Button>
            </Panel>
          </div>
        </div>
      </PageBody>
    </>
  );
}