import React, { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  GitCommit,
  GitPullRequest,
  CircleDot,
  Code2,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useGithubAuth } from "@/features/github/hooks/use-github-auth";
import { useGithubDashboard } from "@/features/github/hooks/use-github-data";
import { GithubConnectCard } from "@/features/github/components/github-connect-card";
import { GithubProfileHeader } from "@/features/github/components/github-profile-header";
import { GithubStatsOverview } from "@/features/github/components/github-stats-overview";
import { GithubContributionGraph } from "@/features/github/components/github-contribution-graph";
import { GithubRepositoryList } from "@/features/github/components/github-repository-list";
import { GithubPinnedRepos } from "@/features/github/components/github-pinned-repos";
import { GithubRecentActivity } from "@/features/github/components/github-recent-activity";
import { GithubCommitsList } from "@/features/github/components/github-commits-list";
import { GithubPullRequests } from "@/features/github/components/github-pull-requests";
import { GithubIssuesList } from "@/features/github/components/github-issues-list";
import { GithubLanguageBreakdown } from "@/features/github/components/github-language-breakdown";

interface GithubSearch {
  code?: string;
}

export const Route = createFileRoute("/github")({
  validateSearch: (search: Record<string, unknown>): GithubSearch => ({
    code: (search.code as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "GitHub · Engineering OS" },
      { name: "description", content: "Real repositories, commits, contribution health, PRs, and activity." },
    ],
  }),
  component: GithubPage,
});

function GithubPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const {
    token,
    user,
    isLoading: isAuthLoading,
    error: authError,
    authUrl,
    isOAuthAvailable,
    connectWithToken,
    handleOAuthCode,
    disconnect,
    refetchUser,
  } = useGithubAuth();

  // Process OAuth callback code if present in URL
  useEffect(() => {
    if (search.code) {
      handleOAuthCode(search.code).then(() => {
        // Clear code query parameter from URL
        navigate({ search: {} as any, replace: true });
      });
    }
  }, [search.code, handleOAuthCode, navigate]);

  const {
    repos,
    pinnedRepos,
    languages,
    activity,
    pullRequests,
    issues,
    commits,
    contributions,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetchAll,
  } = useGithubDashboard(token, user);

  // If not authenticated or loading auth
  if (isAuthLoading) {
    return (
      <>
        <PageHeader
          eyebrow="Open work"
          title="GitHub"
          description="Public-shaped engineering — real repos, commits, and activity."
        />
        <PageBody>
          <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Authenticating GitHub connection...
          </div>
        </PageBody>
      </>
    );
  }

  if (!token || !user) {
    return (
      <>
        <PageHeader
          eyebrow="Open work"
          title="GitHub"
          description="Public-shaped engineering — real repos, commits, and activity."
        />
        <PageBody>
          <GithubConnectCard
            authUrl={authUrl}
            isOAuthAvailable={isOAuthAvailable}
            onConnectToken={async (t) => {
              await connectWithToken(t);
            }}
            isLoading={isAuthLoading}
            error={authError}
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Open work"
        title="GitHub"
        description="Public-shaped engineering — real repos, commits, and activity."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchUser();
              refetchAll();
            }}
            disabled={isDashboardLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isDashboardLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      <PageBody>
        <div className="space-y-6">
          {/* User Profile Header */}
          <GithubProfileHeader
            user={user}
            onRefresh={() => {
              refetchUser();
              refetchAll();
            }}
            onDisconnect={disconnect}
            isRefreshing={isDashboardLoading}
          />

          {/* Stats Overview */}
          <GithubStatsOverview
            repos={repos}
            commits={commits}
            pullRequests={pullRequests}
            issues={issues}
          />

          {/* Dashboard Error Alert */}
          {isDashboardError && (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">GitHub Data Error</AlertTitle>
              <AlertDescription className="text-xs flex items-center justify-between">
                <span>{dashboardError || "Failed to fetch live GitHub data."}</span>
                <Button size="sm" variant="outline" onClick={() => refetchAll()} className="ml-2">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* 52-Week Contribution Calendar Heatmap */}
          <GithubContributionGraph contributions={contributions} isLoading={isDashboardLoading} />

          {/* Tabs for Repositories, Activity, Commits, PRs, Issues */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 md:w-auto md:inline-grid">
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <Activity className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="repos" className="gap-1.5 text-xs">
                <Code2 className="h-3.5 w-3.5" /> Repos ({repos.length})
              </TabsTrigger>
              <TabsTrigger value="commits" className="gap-1.5 text-xs">
                <GitCommit className="h-3.5 w-3.5" /> Commits ({commits.length})
              </TabsTrigger>
              <TabsTrigger value="prs" className="gap-1.5 text-xs">
                <GitPullRequest className="h-3.5 w-3.5" /> PRs ({pullRequests.length})
              </TabsTrigger>
              <TabsTrigger value="issues" className="gap-1.5 text-xs">
                <CircleDot className="h-3.5 w-3.5" /> Issues ({issues.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  <GithubPinnedRepos repos={pinnedRepos} isLoading={isDashboardLoading} />
                  <GithubLanguageBreakdown languages={languages} isLoading={isDashboardLoading} />
                </div>
                <div>
                  <GithubRecentActivity activity={activity} isLoading={isDashboardLoading} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="repos" className="mt-4">
              <GithubRepositoryList repos={repos} isLoading={isDashboardLoading} />
            </TabsContent>

            <TabsContent value="commits" className="mt-4">
              <GithubCommitsList commits={commits} isLoading={isDashboardLoading} />
            </TabsContent>

            <TabsContent value="prs" className="mt-4">
              <GithubPullRequests pullRequests={pullRequests} isLoading={isDashboardLoading} />
            </TabsContent>

            <TabsContent value="issues" className="mt-4">
              <GithubIssuesList issues={issues} isLoading={isDashboardLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>
    </>
  );
}