import React from "react";
import { Panel } from "@/components/stat-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GithubContributionCalendar } from "../types/github.types";

interface GithubContributionGraphProps {
  contributions: GithubContributionCalendar | null;
  isLoading?: boolean;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-muted/40 hover:border-border",
  1: "bg-emerald-950/70 dark:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300",
  2: "bg-emerald-700/80 dark:bg-emerald-700/80 border border-emerald-600/50 text-white",
  3: "bg-emerald-500 dark:bg-emerald-500 border border-emerald-400 text-white shadow-sm shadow-emerald-500/20",
  4: "bg-emerald-400 dark:bg-emerald-400 border border-emerald-300 text-white shadow-md shadow-emerald-400/40",
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GithubContributionGraph({
  contributions,
  isLoading,
}: GithubContributionGraphProps) {
  if (isLoading || !contributions) {
    return (
      <Panel title="Contribution activity">
        <div className="flex h-36 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading contribution graph...
        </div>
      </Panel>
    );
  }

  // Generate month headers from the calendar weeks
  const monthLabels: Array<{ name: string; index: number }> = [];
  let lastMonth = -1;

  contributions.weeks.forEach((week, wIndex) => {
    if (week.days.length > 0) {
      const firstDay = new Date(week.days[0].date);
      const m = firstDay.getMonth();
      if (m !== lastMonth && wIndex % 4 === 0) {
        monthLabels.push({ name: MONTH_NAMES[m], index: wIndex });
        lastMonth = m;
      }
    }
  });

  return (
    <Panel
      title="Contribution activity"
      action={
        <span className="text-xs font-mono text-muted-foreground">
          <strong className="text-foreground font-semibold">{contributions.totalContributions.toLocaleString()}</strong> contributions in the last year
        </span>
      }
    >
      <div className="overflow-x-auto pb-2 pt-1">
        <TooltipProvider delayDuration={100}>
          <div className="inline-block min-w-max space-y-1.5">
            {/* Month labels row */}
            <div className="flex text-[10px] font-mono text-muted-foreground pl-6">
              {contributions.weeks.map((_, wIdx) => {
                const label = monthLabels.find((m) => m.index === wIdx);
                return (
                  <div key={wIdx} className="w-3 text-center">
                    {label ? label.name : ""}
                  </div>
                );
              })}
            </div>

            {/* Grid with day of week labels */}
            <div className="flex items-start gap-1">
              <div className="flex flex-col justify-between text-[9px] font-mono text-muted-foreground h-[92px] pr-1 select-none">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="flex gap-[3px]">
                {contributions.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.days.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-2.5 w-2.5 rounded-[2px] transition-all cursor-pointer ${
                              LEVEL_CLASSES[day.level] || LEVEL_CLASSES[0]
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[11px] font-mono py-1 px-2">
                          <p className="font-semibold">{day.count} contribution{day.count === 1 ? "" : "s"}</p>
                          <p className="text-muted-foreground text-[10px]">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend Footer */}
            <div className="flex items-center justify-end gap-1.5 pt-2 text-[10px] font-mono text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-[2.5px]">
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} className={`h-2.5 w-2.5 rounded-[2px] ${LEVEL_CLASSES[lvl]}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </Panel>
  );
}
