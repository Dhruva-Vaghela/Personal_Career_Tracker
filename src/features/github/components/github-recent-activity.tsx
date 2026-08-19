import React from "react";
import { GitCommit, GitPullRequest, CircleDot, Star, GitFork, PlusCircle, MessageSquare, Activity } from "lucide-react";
import { Panel } from "@/components/stat-card";
import { formatDistanceToNow } from "date-fns";
import type { GithubEvent } from "../types/github.types";

interface GithubRecentActivityProps {
  activity: GithubEvent[];
  isLoading?: boolean;
}

export function GithubRecentActivity({ activity, isLoading }: GithubRecentActivityProps) {
  if (isLoading) {
    return (
      <Panel title="Recent Activity">
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Loading activity stream...
        </div>
      </Panel>
    );
  }

  if (activity.length === 0) {
    return (
      <Panel title="Recent Activity">
        <div className="py-6 text-center text-xs text-muted-foreground">
          No recent activity found.
        </div>
      </Panel>
    );
  }

  const renderEventDetails = (event: GithubEvent) => {
    const repoName = event.repo.name;
    const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true });

    switch (event.type) {
      case "PushEvent": {
        const commitCount = event.payload.commits?.length || 1;
        const msg = event.payload.commits?.[0]?.message || "Pushed commits to repository";
        return {
          icon: <GitCommit className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />,
          title: msg.split("\n")[0],
          meta: `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to ${repoName} · ${timeAgo}`,
        };
      }
      case "PullRequestEvent": {
        const action = event.payload.action || "updated";
        const title = event.payload.pull_request?.title || "Pull Request";
        return {
          icon: <GitPullRequest className="mt-0.5 h-4 w-4 text-sky-500 shrink-0" />,
          title: `${action} PR: ${title}`,
          meta: `${repoName} · ${timeAgo}`,
        };
      }
      case "IssuesEvent": {
        const action = event.payload.action || "updated";
        const title = event.payload.issue?.title || "Issue";
        return {
          icon: <CircleDot className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />,
          title: `${action} issue: ${title}`,
          meta: `${repoName} · ${timeAgo}`,
        };
      }
      case "WatchEvent": {
        return {
          icon: <Star className="mt-0.5 h-4 w-4 text-yellow-500 shrink-0" />,
          title: `Starred repository ${repoName}`,
          meta: timeAgo,
        };
      }
      case "ForkEvent": {
        return {
          icon: <GitFork className="mt-0.5 h-4 w-4 text-purple-500 shrink-0" />,
          title: `Forked ${repoName}`,
          meta: timeAgo,
        };
      }
      case "CreateEvent": {
        const refType = event.payload.ref_type || "repository";
        return {
          icon: <PlusCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />,
          title: `Created ${refType} ${event.payload.ref || ""} in ${repoName}`,
          meta: timeAgo,
        };
      }
      case "IssueCommentEvent": {
        return {
          icon: <MessageSquare className="mt-0.5 h-4 w-4 text-indigo-400 shrink-0" />,
          title: `Commented on issue in ${repoName}`,
          meta: timeAgo,
        };
      }
      default: {
        return {
          icon: <Activity className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />,
          title: `${event.type.replace("Event", "")} on ${repoName}`,
          meta: timeAgo,
        };
      }
    }
  };

  return (
    <Panel title="Recent Activity" action={<span className="text-[11px] font-mono text-muted-foreground">Live Feed</span>}>
      <ul className="space-y-3.5">
        {activity.slice(0, 15).map((event) => {
          const details = renderEventDetails(event);
          return (
            <li key={event.id} className="flex items-start gap-3 text-xs">
              {details.icon}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">{details.title}</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{details.meta}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
