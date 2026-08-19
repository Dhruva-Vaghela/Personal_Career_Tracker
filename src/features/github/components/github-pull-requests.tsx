import React from "react";
import { GitPullRequest, ExternalLink, GitMerge, XCircle } from "lucide-react";
import { Panel } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { GithubPullRequest } from "../types/github.types";

interface GithubPullRequestsProps {
  pullRequests: GithubPullRequest[];
  isLoading?: boolean;
}

export function GithubPullRequests({ pullRequests, isLoading }: GithubPullRequestsProps) {
  if (isLoading) {
    return (
      <Panel title="Pull Requests">
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Loading pull requests...
        </div>
      </Panel>
    );
  }

  if (pullRequests.length === 0) {
    return (
      <Panel title="Pull Requests">
        <div className="py-6 text-center text-xs text-muted-foreground">
          No pull requests found.
        </div>
      </Panel>
    );
  }

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "open":
        return (
          <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 gap-1 text-[10px] py-0">
            <GitPullRequest className="h-3 w-3" /> Open
          </Badge>
        );
      case "merged":
        return (
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1 text-[10px] py-0">
            <GitMerge className="h-3 w-3" /> Merged
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px] py-0">
            <XCircle className="h-3 w-3" /> Closed
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-[10px] py-0">{state}</Badge>;
    }
  };

  return (
    <Panel title={`Pull Requests (${pullRequests.length})`}>
      <div className="divide-y divide-border/60">
        {pullRequests.map((pr) => (
          <div key={pr.id} className="group flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5"
                >
                  #{pr.number} {pr.title}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                {pr.repo_name && <span className="font-medium text-foreground">{pr.repo_name}</span>}
                <span>· updated {formatDistanceToNow(new Date(pr.updated_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              {getStatusBadge(pr.state)}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
