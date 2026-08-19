import React, { useState } from "react";
import { Search, Star, GitFork, ExternalLink, Lock, GitBranch, Code2 } from "lucide-react";
import { Panel } from "@/components/stat-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { GithubRepo } from "../types/github.types";

interface GithubRepositoryListProps {
  repos: GithubRepo[];
  isLoading?: boolean;
}

export function GithubRepositoryList({ repos, isLoading }: GithubRepositoryListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "source" | "fork">("all");

  const filteredRepos = repos.filter((repo) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "source"
        ? !repo.fork
        : repo.fork;

    const matchesSearch =
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(search.toLowerCase())) ||
      (repo.language && repo.language.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <Panel
      title={`Repositories (${repos.length})`}
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-muted p-0.5 text-[11px]">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("source")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "source" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sources
            </button>
            <button
              onClick={() => setFilter("fork")}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                filter === "fork" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Forks
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search repositories by name, language, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading repositories...
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No repositories found matching "{search}".
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredRepos.map((repo) => (
              <div key={repo.id} className="group py-3.5 transition-colors first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
                      >
                        <Code2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                        {repo.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      {repo.private && (
                        <Badge variant="outline" className="gap-1 text-[10px] py-0 px-1.5 text-amber-500 border-amber-500/30">
                          <Lock className="h-2.5 w-2.5" /> Private
                        </Badge>
                      )}
                      {repo.fork && (
                        <Badge variant="secondary" className="gap-1 text-[10px] py-0 px-1.5">
                          <GitFork className="h-2.5 w-2.5" /> Fork
                        </Badge>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )}

                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {repo.topics.slice(0, 5).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary hover:bg-primary/20">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {repo.language && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-foreground font-medium">
                          <span className="h-2 w-2 rounded-full bg-primary" /> {repo.language}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono">
                        <Star className="h-3 w-3 text-amber-400" /> {repo.stargazers_count}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono">
                        <GitBranch className="h-3 w-3" /> {repo.forks_count}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
