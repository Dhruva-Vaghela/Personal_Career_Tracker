import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid,
  Radar, RadarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { useAppStore } from "@/store/app-store";
import { useLearningEngine } from "@/features/learning/hooks/use-learning-engine";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Engineering OS" },
      { name: "description", content: "Growth analytics across coding, reading, and shipping." },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = { background: "oklch(0.18 0.014 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8, fontSize: 12 };

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center border border-dashed border-border/50 rounded-lg bg-background/20">
      <p className="text-[13px] text-muted-foreground">{message}</p>
    </div>
  );
}

function AnalyticsPage() {
  const { learningStreak, analytics } = useAppStore();
  const { data: learningEngine } = useLearningEngine();

  // Dynamically generate skill radar from roadmap phase completion percentages
  const radar = learningEngine?.phases.map(phase => ({
    skill: phase.title.length > 10 ? phase.title.substring(0, 10) + '...' : phase.title,
    A: phase.progress.completionPercentage
  })) || [];

  return (
    <>
      <PageHeader eyebrow="Measure what matters" title="Analytics" description="Compounding is invisible day-to-day and obvious month-to-month." />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-2">
          
          <Panel title="Weekly activity">
            <div className="h-64">
              {analytics.totalLearningHours === 0 && analytics.projectsBuilt === 0 ? (
                <EmptyChartState message="No activity recorded yet." />
              ) : (
                <ResponsiveContainer>
                  {/* Simplified bar chart with real data representing 'This Week' vs 'Previous' since we don't store deep history yet */}
                  <BarChart data={[
                    { week: 'Past', coding: 0, reading: 0, projects: 0 },
                    { week: 'Current', coding: analytics.totalLearningHours, reading: analytics.problemsSolved, projects: analytics.projectsBuilt }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                    <XAxis dataKey="week" stroke="oklch(0.66 0.02 260)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.66 0.02 260)" fontSize={10} tickLine={false} axisLine={false} width={24} />
                    <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
                    <Bar dataKey="coding" stackId="a" fill="oklch(0.78 0.16 220)" />
                    <Bar dataKey="reading" stackId="a" fill="oklch(0.75 0.17 155)" />
                    <Bar dataKey="projects" stackId="a" fill="oklch(0.72 0.19 300)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel title="Skill radar">
            <div className="h-64">
              {radar.length === 0 || radar.every(r => r.A === 0) ? (
                <EmptyChartState message="Start completing roadmap phases to build your skill radar." />
              ) : (
                <ResponsiveContainer>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="oklch(1 0 0 / 10%)" />
                    <PolarAngleAxis dataKey="skill" stroke="oklch(0.66 0.02 260)" fontSize={11} />
                    <Radar dataKey="A" stroke="oklch(0.78 0.16 220)" fill="oklch(0.78 0.16 220)" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel title="Burnup · roadmap progress">
            <div className="h-64">
              {learningEngine?.progress.completionPercentage === 0 ? (
                <EmptyChartState message="No roadmap progress yet." />
              ) : (
                <ResponsiveContainer>
                  {/* Simplified burnup showing just the current completion state */}
                  <LineChart data={[
                    { day: 'Start', done: 0, scope: 100 },
                    { day: 'Now', done: learningEngine?.progress.completionPercentage || 0, scope: 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                    <XAxis dataKey="day" stroke="oklch(0.66 0.02 260)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.66 0.02 260)" fontSize={10} tickLine={false} axisLine={false} width={24} />
                    <RTooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="scope" stroke="oklch(0.66 0.02 260)" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="done" stroke="oklch(0.78 0.16 220)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel title="Consistency">
            {learningStreak.currentStreak === 0 ? (
              <EmptyChartState message="Complete today's mission to start your streak!" />
            ) : (
              <>
                <div className="grid grid-cols-12 gap-1.5">
                  {Array.from({ length: 84 }).map((_, i) => {
                    // Only fill in dots up to the current streak
                    const v = i < learningStreak.currentStreak ? 4 : 0;
                    const bg = ["bg-secondary/60","bg-primary/20","bg-primary/40","bg-primary/60","bg-primary/90"][v];
                    return <div key={i} className={`aspect-square rounded ${bg}`} />;
                  })}
                </div>
                <p className="mt-4 text-[12px] text-muted-foreground">
                  Current active streak: <span className="font-mono text-foreground">{learningStreak.currentStreak} days</span>
                </p>
              </>
            )}
          </Panel>

        </div>
      </PageBody>
    </>
  );
}