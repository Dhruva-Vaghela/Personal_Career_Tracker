import React from "react";
import { CircleDot, ExternalLink, CheckCircle2 } from "lucide-react";
import { Panel } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { GithubIssue } from "../types/github.types";

interface GithubIssuesListProps {
  issues: GithubIssue[];
  isLoading?: boolean;
}

export function GithubIssuesList({ issues, isLoading }: GithubIssuesListProps) {
  if (isLoading) {
    return (
      <Panel title="Issues">
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Loading issues...
        </div>
      </Panel>
    );
  }

  if (issues.length === 0) {
    return (
      <Panel title="Issues">
        <div className="py-6 text-center text-xs text-muted-foreground">
          No issues found.
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={`Issues (${issues.length})`}>
      <div className="divide-y divide-border/60">
        {issues.map((issue) => (
          <div key={issue.id} className="group flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5"
                >
                  #{issue.number} {issue.title}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono">
                {issue.repo_name && <span className="font-medium text-foreground">{issue.repo_name}</span>}
                <span>· updated {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}</span>
              </div>

              {issue.labels && issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {issue.labels.map((lbl) => (
                    <span
                      key={lbl.id}
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-mono border"
                      style={{
                        backgroundColor: `#${lbl.color}15`,
                        color: `#${lbl.color}`,
                        borderColor: `#${lbl.color}40`,
                      }}
                    >
                      {lbl.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 pt-0.5">
              {issue.state === "open" ? (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 text-[10px] py-0">
                  <CircleDot className="h-3 w-3" /> Open
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px] py-0">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Closed
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
