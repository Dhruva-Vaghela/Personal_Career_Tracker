import React from "react";
import { Code2 } from "lucide-react";
import { Panel } from "@/components/stat-card";
import type { GithubLanguageStat } from "../types/github.types";

interface GithubLanguageBreakdownProps {
  languages: GithubLanguageStat[];
  isLoading?: boolean;
}

export function GithubLanguageBreakdown({ languages, isLoading }: GithubLanguageBreakdownProps) {
  if (isLoading) {
    return (
      <Panel title="Language Breakdown">
        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Calculating languages...
        </div>
      </Panel>
    );
  }

  if (languages.length === 0) {
    return null;
  }

  return (
    <Panel
      title="Language Breakdown"
      action={<Code2 className="h-3.5 w-3.5 text-muted-foreground" />}
    >
      <div className="space-y-4">
        {/* Multi-color segment progress bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60">
          {languages.map((lang) => (
            <div
              key={lang.name}
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color,
              }}
              title={`${lang.name}: ${lang.percentage}%`}
              className="h-full transition-all"
            />
          ))}
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {languages.map((lang) => (
            <div key={lang.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: lang.color }}
              />
              <span className="font-mono font-medium text-foreground truncate">
                {lang.name}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {lang.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
