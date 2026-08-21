import React from "react";
import { Github, Users, MapPin, Building, Link as LinkIcon, RefreshCw, LogOut, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { GithubUser } from "../types/github.types";

interface GithubProfileHeaderProps {
  user: GithubUser;
  onRefresh: () => void;
  onDisconnect: () => void;
  isRefreshing?: boolean;
}

export function GithubProfileHeader({
  user,
  onRefresh,
  onDisconnect,
  isRefreshing,
}: GithubProfileHeaderProps) {
  const handleDisconnectClick = () => {
    if (
      window.confirm(
        "Are you sure you want to disconnect your GitHub account? Your connection will be removed from your account."
      )
    ) {
      onDisconnect();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback className="font-mono font-bold text-lg">
              {user.login.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{user.name || user.login}</h2>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                @{user.login} <ExternalLink className="h-3 w-3" />
              </a>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500">
                ✓ GitHub Connected
              </span>
            </div>
            {user.bio && (
              <p className="max-w-xl text-xs text-muted-foreground line-clamp-2">
                {user.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
              {user.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground/70" /> {user.location}
                </span>
              )}
              {user.company && (
                <span className="inline-flex items-center gap-1">
                  <Building className="h-3 w-3 text-muted-foreground/70" /> {user.company}
                </span>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <LinkIcon className="h-3 w-3" /> Website
                </a>
              )}
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Users className="h-3 w-3 text-muted-foreground/70" /> {user.followers} followers · {user.following} following
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh GitHub Data
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDisconnectClick}
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Disconnect GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
