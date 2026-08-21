import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GithubApiService } from "../services/github-api.service";
import { GithubCacheService } from "../services/github-cache.service";
import type { GithubUser, GithubRepo } from "../types/github.types";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export function useGithubRepos(token: string | null, username?: string) {
  return useQuery({
    queryKey: ["github", "repos", token, username],
    queryFn: () => GithubApiService.fetchUserRepos(token!, username),
    enabled: Boolean(token),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useGithubActivity(token: string | null, username?: string) {
  return useQuery({
    queryKey: ["github", "activity", token, username],
    queryFn: () => GithubApiService.fetchUserEvents(token!, username!),
    enabled: Boolean(token && username),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useGithubPullRequests(token: string | null, username?: string) {
  return useQuery({
    queryKey: ["github", "prs", token, username],
    queryFn: () => GithubApiService.fetchUserPullRequests(token!, username!),
    enabled: Boolean(token && username),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useGithubIssues(token: string | null, username?: string) {
  return useQuery({
    queryKey: ["github", "issues", token, username],
    queryFn: () => GithubApiService.fetchUserIssues(token!, username!),
    enabled: Boolean(token && username),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useGithubCommits(token: string | null, username?: string, repos?: GithubRepo[]) {
  return useQuery({
    queryKey: ["github", "commits", token, username, repos?.map((r) => r.id)],
    queryFn: () => GithubApiService.fetchUserCommits(token!, username!, repos || []),
    enabled: Boolean(token && username && repos && repos.length > 0),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useGithubContributions(token: string | null, username?: string) {
  return useQuery({
    queryKey: ["github", "contributions", token, username],
    queryFn: () => GithubApiService.fetchContributionGraph(token!, username!),
    enabled: Boolean(token && username),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useGithubDashboard(token: string | null, user: GithubUser | null) {
  const username = user?.login;

  const reposQuery = useGithubRepos(token, username);
  const activityQuery = useGithubActivity(token, username);
  const prsQuery = useGithubPullRequests(token, username);
  const issuesQuery = useGithubIssues(token, username);
  const contributionsQuery = useGithubContributions(token, username);

  const repos = reposQuery.data || [];
  const commitsQuery = useGithubCommits(token, username, repos);

  const cachedDashboard = GithubCacheService.getCachedDashboardData<{
    repos: GithubRepo[];
    activity: any[];
    pullRequests: any[];
    issues: any[];
    commits: any[];
    contributions: any;
    updatedAt: string;
  }>();

  // Cache last known successful dashboard state
  useEffect(() => {
    if (reposQuery.data || contributionsQuery.data) {
      GithubCacheService.setCachedDashboardData({
        repos: reposQuery.data || cachedDashboard?.repos || [],
        activity: activityQuery.data || cachedDashboard?.activity || [],
        pullRequests: prsQuery.data || cachedDashboard?.pullRequests || [],
        issues: issuesQuery.data || cachedDashboard?.issues || [],
        commits: commitsQuery.data || cachedDashboard?.commits || [],
        contributions: contributionsQuery.data || cachedDashboard?.contributions || null,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [
    reposQuery.data,
    activityQuery.data,
    prsQuery.data,
    issuesQuery.data,
    commitsQuery.data,
    contributionsQuery.data,
  ]);

  const finalRepos = reposQuery.data || cachedDashboard?.repos || [];
  const languages = GithubApiService.calculateLanguageDistribution(finalRepos);
  const pinnedRepos = GithubApiService.getPinnedRepos(finalRepos);

  const isLoading =
    !cachedDashboard &&
    (reposQuery.isLoading ||
      activityQuery.isLoading ||
      prsQuery.isLoading ||
      issuesQuery.isLoading ||
      contributionsQuery.isLoading);

  const isError =
    reposQuery.isError ||
    activityQuery.isError ||
    prsQuery.isError ||
    issuesQuery.isError ||
    contributionsQuery.isError;

  const error =
    (reposQuery.error as any)?.message ||
    (activityQuery.error as any)?.message ||
    (prsQuery.error as any)?.message ||
    (issuesQuery.error as any)?.message ||
    (contributionsQuery.error as any)?.message ||
    null;

  return {
    repos: finalRepos,
    pinnedRepos,
    languages,
    activity: activityQuery.data || cachedDashboard?.activity || [],
    pullRequests: prsQuery.data || cachedDashboard?.pullRequests || [],
    issues: issuesQuery.data || cachedDashboard?.issues || [],
    commits: commitsQuery.data || cachedDashboard?.commits || [],
    contributions: contributionsQuery.data || cachedDashboard?.contributions || null,
    lastUpdated: cachedDashboard?.updatedAt || null,
    isLoading,
    isError,
    error,
    refetchAll: () => {
      reposQuery.refetch();
      activityQuery.refetch();
      prsQuery.refetch();
      issuesQuery.refetch();
      commitsQuery.refetch();
      contributionsQuery.refetch();
    },
  };
}
