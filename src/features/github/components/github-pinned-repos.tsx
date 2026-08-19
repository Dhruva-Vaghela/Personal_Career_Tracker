import React from "react";
import { Star, GitFork, ExternalLink, Pin, Code2 } from "lucide-react";
import { Panel } from "@/components/stat-card";
import type { GithubRepo } from "../types/github.types";

interface GithubPinnedReposProps {
  repos: GithubRepo[];
  isLoading?: boolean;
}

export function GithubPinnedRepos({ repos, isLoading }: GithubPinnedReposProps) {
  if (isLoading) {
    return (
      <Panel title="Pinned Repositories">
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Loading pinned repositories...
        </div>
      </Panel>
    );
  }

  if (repos.length === 0) return null;

  return (
    <Panel
      title="Pinned & Top Repositories"
      action={<Pin className="h-3.5 w-3.5 text-muted-foreground" />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{repo.name}</span>
                </div>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
              </div>
              {repo.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {repo.description}
                </p>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border/40">
              {repo.language ? (
                <span className="inline-flex items-center gap-1 text-foreground font-medium">
                  <span className="h-2 w-2 rounded-full bg-primary" /> {repo.language}
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400" /> {repo.stargazers_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork className="h-3 w-3" /> {repo.forks_count}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </Panel>
  );
}
