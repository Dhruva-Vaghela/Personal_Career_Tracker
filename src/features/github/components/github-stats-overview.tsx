import React from "react";
import { Github, Star, GitCommit, GitPullRequest, CircleDot } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import type { GithubRepo, GithubCommit, GithubPullRequest, GithubIssue } from "../types/github.types";

interface GithubStatsOverviewProps {
  repos: GithubRepo[];
  commits: GithubCommit[];
  pullRequests: GithubPullRequest[];
  issues: GithubIssue[];
}

export function GithubStatsOverview({
  repos,
  commits,
  pullRequests,
  issues,
}: GithubStatsOverviewProps) {
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const openPRs = pullRequests.filter((pr) => pr.state === "open").length;
  const openIssues = issues.filter((i) => i.state === "open").length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={Github}
        label="Public Repos"
        value={repos.length}
        hint={`${repos.filter((r) => r.fork).length} forks`}
      />
      <StatCard
        icon={Star}
        label="Stars Earned"
        value={totalStars}
        accent="warning"
        hint="All repos"
      />
      <StatCard
        icon={GitCommit}
        label="Recent Commits"
        value={commits.length}
        accent="success"
        hint="Top repos"
      />
      <StatCard
        icon={GitPullRequest}
        label="Open Work"
        value={openPRs + openIssues}
        accent="info"
        hint={`${openPRs} PRs · ${openIssues} Issues`}
      />
    </div>
  );
}
