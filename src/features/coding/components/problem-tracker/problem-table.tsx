import { useState } from "react";
import { format } from "date-fns";
import { CodingProblem, Difficulty, ProblemStatus } from "../../types/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SolutionPanel } from "../solution-review/solution-panel";

interface ProblemTableProps {
  problems: CodingProblem[];
}

export function ProblemTable({ problems }: ProblemTableProps) {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <p className="text-[13px]">No coding problems logged yet.</p>
        <p className="text-[12px] opacity-70 mt-1">Click "Log problem" to start tracking your reps.</p>
      </div>
    );
  }

  // Sort problems by newest first
  const sortedProblems = [...problems].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Problem</th>
              <th className="py-2 pr-4 font-medium">Platform</th>
              <th className="py-2 pr-4 font-medium">Difficulty</th>
              <th className="py-2 pr-4 font-medium">Domains</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProblems.map((problem) => (
              <tr key={problem.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                <td className="py-3 pr-4 font-medium">{problem.title}</td>
                <td className="py-3 pr-4 text-muted-foreground">{problem.platform}</td>
                <td className="py-3 pr-4">
                  <Badge 
                    variant="outline" 
                    className={
                      problem.difficulty === Difficulty.Easy ? "text-green-500 border-green-500/30" : 
                      problem.difficulty === Difficulty.Medium ? "text-yellow-500 border-yellow-500/30" : 
                      "text-red-500 border-red-500/30"
                    }
                  >
                    {problem.difficulty}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {problem.domains.slice(0, 2).map(d => (
                      <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
                    ))}
                    {problem.domains.length > 2 && (
                      <Badge variant="secondary" className="text-[10px]">+{problem.domains.length - 2}</Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {problem.dateSolved ? format(new Date(problem.dateSolved), "MMM d, yyyy") : "-"}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={problem.status === ProblemStatus.Solved || problem.status === ProblemStatus.Revised ? "default" : "secondary"}>
                    {problem.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProblem(problem)}>
                    View / Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedProblem} onOpenChange={(open) => !open && setSelectedProblem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProblem?.title}</DialogTitle>
          </DialogHeader>
          {selectedProblem && <SolutionPanel problemId={selectedProblem.id} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
