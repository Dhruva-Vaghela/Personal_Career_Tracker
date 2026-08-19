import React from "react";
import { GitCommit, ExternalLink, Code } from "lucide-react";
import { Panel } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { GithubCommit } from "../types/github.types";

interface GithubCommitsListProps {
  commits: GithubCommit[];
  isLoading?: boolean;
}

export function GithubCommitsList({ commits, isLoading }: GithubCommitsListProps) {
  if (isLoading) {
    return (
      <Panel title="Recent Commits">
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Loading commits...
        </div>
      </Panel>
    );
  }

  if (commits.length === 0) {
    return (
      <Panel title="Recent Commits">
        <div className="py-6 text-center text-xs text-muted-foreground">
          No recent commits found.
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={`Recent Commits (${commits.length})`}>
      <div className="divide-y divide-border/60">
        {commits.map((c) => {
          const firstLineMsg = c.commit.message.split("\n")[0];
          const shortSha = c.sha.substring(0, 7);
          const dateStr = c.commit.author.date
            ? formatDistanceToNow(new Date(c.commit.author.date), { addSuffix: true })
            : "";

          return (
            <div key={c.sha} className="group flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-emerald-500 shrink-0" />
                  <a
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                  >
                    {firstLineMsg}
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pl-6">
                  {c.repository && (
                    <span className="font-mono font-medium text-foreground inline-flex items-center gap-1">
                      <Code className="h-3 w-3 text-muted-foreground" /> {c.repository.name}
                    </span>
                  )}
                  <span>· {dateStr}</span>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="font-mono text-[10px] gap-1 hover:border-primary">
                    {shortSha} <ExternalLink className="h-2.5 w-2.5" />
                  </Badge>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
