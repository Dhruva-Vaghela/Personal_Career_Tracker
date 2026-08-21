import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Flame,
  BookOpen,
  Code2,
  GitCommit,
  Trophy,
  Clock,
  Target,
  ArrowUpRight,
  Play,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Award,
  Zap
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { StatCard, Panel } from "@/components/stat-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/app-store";
import { useGithubAuth } from "@/features/github/hooks/use-github-auth";
import { useGithubDashboard } from "@/features/github/hooks/use-github-data";
import careerCurriculum from "@/data/career-curriculum.json";
import { calculateCareerReadiness } from "@/features/career-guide/services/mastery-engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Engineering OS" },
      { name: "description", content: "Your daily engineering command center." },
    ],
  }),
  component: Dashboard,
});

function Heatmap({ data }: { data?: { date: string; count: number }[] }) {
  const weeksCount = 26;
  const daysCount = 7;
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[100px] text-[13px] text-muted-foreground">
        No contribution data yet. Connect GitHub.
      </div>
    );
  }

  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: weeksCount }).map((_, w) => {
        const dataOffset = data.length > weeksCount * daysCount ? data.length - weeksCount * daysCount : 0;
        return (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: daysCount }).map((_, d) => {
              const idx = dataOffset + w * daysCount + d;
              const count = idx < data.length ? data[idx].count : 0;
              let v = 0;
              if (count > 0 && count <= 3) v = 1;
              else if (count > 3 && count <= 6) v = 2;
              else if (count > 6 && count <= 10) v = 3;
              else if (count > 10) v = 4;
              
              const bg = [
                "bg-secondary/60",
                "bg-primary/20",
                "bg-primary/40",
                "bg-primary/60",
                "bg-primary/90",
              ][v];
              return <div key={d} className={`h-2.5 w-2.5 rounded-[3px] ${bg}`} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function Dashboard() {
  const { token, user } = useGithubAuth();
  const githubData = useGithubDashboard(token, user);
  const heatmapData = githubData.contributions?.weeks.flatMap((w: any) => w.days) || [];
  
  const {
    analytics,
    learningStreak,
    weeklyGoals,
    todaysMission,
    toggleGoal,
    addGoal,
    removeGoal,
    topicMasteries,
    completedCareerSubtopics,
    projects
  } = useAppStore();

  const [newGoal, setNewGoal] = useState("");

  const readiness = calculateCareerReadiness(topicMasteries, projects.length);

  // Find active 12-Module Career Module & Topic in progress
  let activeModule = careerCurriculum.modules[0];
  let activeTopic = activeModule.topics[0];

  for (const mod of careerCurriculum.modules) {
    for (const top of mod.topics) {
      const tm = topicMasteries[top.id];
      if (!tm || tm.status !== "Mastered") {
        activeModule = mod;
        activeTopic = top;
        break;
      }
    }
    if (activeModule.id === mod.id && activeTopic.id !== mod.topics[0].id) {
      break;
    }
  }

  const activeTopicMastery = topicMasteries[activeTopic.id] || {
    masteryPercentage: 0,
    status: "Not Started",
  };

  const learningHoursData = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    hours: i === 29 ? analytics.totalLearningHours : 0,
  }));

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addGoal(newGoal.trim());
      setNewGoal("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={`Streak: ${learningStreak.currentStreak} days`}
        title="Good morning, engineer."
        description="One focused day at a time — you're compounding."
        actions={
          <>
            <Link to="/mission">
              <Button variant="secondary" size="sm" className="gap-1.5 mr-2 text-xs">
                <Sparkles className="h-3.5 w-3.5" /> AI Mentor
              </Button>
            </Link>
            <Link to="/roadmap">
              <Button size="sm" className="gap-1.5 text-xs">
                <Play className="h-3.5 w-3.5" /> Open Topic Studio
              </Button>
            </Link>
          </>
        }
      />

      <PageBody>
        {/* Mission Banner */}
        <div className="surface-panel glow-primary relative mb-6 overflow-hidden p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ backgroundImage: "var(--gradient-glow)" }}
          />
          <div className="relative grid gap-6 md:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-primary/80">
                <Target className="h-3.5 w-3.5" /> Today's mission
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                {todaysMission ? todaysMission.title : "No active mission set."}
              </h2>
              <p className="mt-2 max-w-xl text-[13px] text-muted-foreground">
                {todaysMission ? todaysMission.description : `Generate a personalized daily mission for Module ${activeModule.number}: ${activeModule.title}.`}
              </p>
              
              {todaysMission && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-md">
                    {todaysMission.estimatedTimeMinutes} min budget
                  </Badge>
                </div>
              )}
              
              <div className="mt-5 flex gap-2">
                <Link
                  to="/mission"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90"
                >
                  {todaysMission ? "Continue mission" : "Generate mission"} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Active 12-Module Card */}
            <div className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Active Career Module
                </div>
                <Badge className="rounded-md bg-primary/15 text-primary hover:bg-primary/15 capitalize text-[10px]">
                  Mod {activeModule.number}
                </Badge>
              </div>

              <div className="text-[14px] font-bold leading-tight text-foreground">
                {activeModule.title}
              </div>

              <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Active Topic: <strong className="text-foreground">{activeTopic.title}</strong>
              </div>

              <div className="pt-2 border-t border-border/50">
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Topic Mastery</span>
                  <span className="font-mono text-primary font-bold">
                    {activeTopicMastery.masteryPercentage}%
                  </span>
                </div>
                <Progress
                  value={activeTopicMastery.masteryPercentage}
                  className="h-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={Flame} label="Coding streak" value={`${learningStreak.currentStreak}d`} accent="warning" />
          <StatCard icon={Award} label="Career Readiness" value={`${readiness.overallPercentage}%`} accent="info" />
          <StatCard icon={Code2} label="Problems solved" value={analytics.problemsSolved} />
          <StatCard icon={GitCommit} label="GH Commits" value={githubData.contributions?.totalContributions ?? 0} accent="success" />
          <StatCard icon={Clock} label="Learning hrs" value={analytics.totalLearningHours} accent="info" />
          <StatCard icon={Trophy} label="Projects" value={analytics.projectsBuilt} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Panel title="Learning hours (Real analytics)">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={learningHoursData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                    <XAxis
                      dataKey="day"
                      stroke="oklch(0.66 0.02 260)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="oklch(0.66 0.02 260)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={24}
                    />
                    <RTooltip
                      contentStyle={{
                        background: "oklch(0.18 0.014 260)",
                        border: "1px solid oklch(1 0 0 / 10%)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="oklch(0.78 0.16 220)"
                      strokeWidth={2}
                      fill="url(#g1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              title="GitHub contributions"
              action={<span className="text-[11px] text-muted-foreground">{githubData.contributions?.totalContributions ?? 0} contributions</span>}
            >
              <div className="overflow-x-auto pb-1">
                <Heatmap data={heatmapData} />
              </div>
            </Panel>

            {/* 12-Module Career Module Progress */}
            <Panel
              title="12-Module Career Curriculum Progress"
              action={
                <Link
                  to="/roadmap"
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Open Career Guide →
                </Link>
              }
            >
              <div className="space-y-3">
                {careerCurriculum.modules.map((mod) => {
                  const masteredCount = mod.topics.filter(
                    (t) => topicMasteries[t.id]?.status === "Mastered"
                  ).length;
                  const modPercent = mod.topics.length > 0 ? Math.round((masteredCount / mod.topics.length) * 100) : 0;

                  return (
                    <div key={mod.id} className="flex items-center gap-3">
                      <div className="w-48 shrink-0 text-[12px] font-medium truncate">
                        M{mod.number}. {mod.title}
                      </div>
                      <Progress
                        value={modPercent}
                        className="h-1.5 flex-1"
                      />
                      <div className="w-10 text-right font-mono text-[11px] text-muted-foreground">
                        {modPercent}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel
              title="Weekly goals"
              action={<span className="text-[11px] text-muted-foreground">{weeklyGoals.filter(g => g.done).length} / {weeklyGoals.length}</span>}
            >
              {weeklyGoals.length === 0 ? (
                <div className="text-[13px] text-muted-foreground py-2 text-center">No goals set for this week.</div>
              ) : (
                <ul className="space-y-2.5">
                  {weeklyGoals.map((g) => (
                    <li key={g.id} className="flex items-start gap-2.5 text-[13px] group">
                      <Checkbox 
                        id={g.id}
                        checked={g.done}
                        onCheckedChange={() => toggleGoal(g.id)}
                        className="mt-0.5"
                      />
                      <label 
                        htmlFor={g.id}
                        className={`flex-1 cursor-pointer ${g.done ? "text-muted-foreground line-through" : ""}`}
                      >
                        {g.text}
                      </label>
                      <button 
                        onClick={() => removeGoal(g.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive text-[10px] transition-opacity"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              <form onSubmit={handleAddGoal} className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new goal..."
                  className="flex-1 bg-background/50 border border-border rounded-md px-2 py-1 text-[12px]"
                />
                <Button type="submit" size="sm" variant="secondary" className="h-7 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </form>
            </Panel>

            <Panel title="Active Career Topic">
              <div className="space-y-3">
                <div className="text-[14px] font-bold text-foreground">{activeTopic.title}</div>
                <p className="text-xs text-muted-foreground">{activeTopic.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    {activeModule.category}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {activeTopicMastery.status}
                  </Badge>
                </div>
                <div className="mt-4 pt-2 border-t border-border/50">
                  <Link to="/roadmap" className="text-[12px] text-primary hover:underline font-medium">
                    Open Topic Studio →
                  </Link>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </PageBody>
    </>
  );
}
