import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Code2, Flame, Brain, Bot, Target } from "lucide-react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel, StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCodingStore } from "@/features/coding/store/coding-store";
import { CodingAnalyticsService } from "@/features/coding/services/analytics.service";
import { ProblemTable } from "@/features/coding/components/problem-tracker/problem-table";
import { ProblemForm } from "@/features/coding/components/problem-tracker/problem-form";

export const Route = createFileRoute("/coding")({
  head: () => ({
    meta: [
      { title: "Coding Practice · Engineering OS" },
      { name: "description", content: "Track daily coding practice honestly." },
    ],
  }),
  component: CodingPage,
});

function CodingPage() {
  const problems = useCodingStore((state) => state.problems);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const analytics = useMemo(() => CodingAnalyticsService.calculateAnalytics(problems), [problems]);

  return (
    <>
      <PageHeader
        eyebrow="Muscle memory"
        title="Coding Practice Engine"
        description="Consistent reps beat sporadic marathons. Track your mastery and reviews."
        actions={<Button size="sm" onClick={() => setIsLogModalOpen(true)}>+ Log problem</Button>}
      />
      <PageBody>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Code2} label="Total Solved" value={analytics.totalSolved} />
          <StatCard icon={Flame} label="Streak" value={`${analytics.longestStreak}d`} accent="warning" />
          <StatCard icon={Target} label="Readiness" value={`${analytics.interviewReadinessScore}%`} accent="success" hint="Score" />
          <StatCard icon={Brain} label="Pending Review" value={analytics.revisionPendingCount} accent="info" />
        </div>
        
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Bot} label="Avg Time" value={`${analytics.averageTimePerProblem}m`} />
          <StatCard icon={Code2} label="Easy" value={analytics.easyCount} accent="success" />
          <StatCard icon={Code2} label="Medium" value={analytics.mediumCount} accent="warning" />
          <StatCard icon={Code2} label="Hard" value={analytics.hardCount} accent="destructive" />
        </div>

        <Panel title="Coding Problems">
          <ProblemTable problems={problems} />
        </Panel>
      </PageBody>

      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Coding Problem</DialogTitle>
          </DialogHeader>
          <ProblemForm onSuccess={() => setIsLogModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}