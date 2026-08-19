import { useQuery } from "@tanstack/react-query";
import { GithubApiService } from "../services/github-api.service";
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
  const repos = reposQuery.data || [];

  const activityQuery = useGithubActivity(token, username);
  const prsQuery = useGithubPullRequests(token, username);
  const issuesQuery = useGithubIssues(token, username);
  const commitsQuery = useGithubCommits(token, username, repos);
  const contributionsQuery = useGithubContributions(token, username);

  const languages = GithubApiService.calculateLanguageDistribution(repos);
  const pinnedRepos = GithubApiService.getPinnedRepos(repos);

  const isLoading =
    reposQuery.isLoading ||
    activityQuery.isLoading ||
    prsQuery.isLoading ||
    issuesQuery.isLoading ||
    contributionsQuery.isLoading;

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
    repos,
    pinnedRepos,
    languages,
    activity: activityQuery.data || [],
    pullRequests: prsQuery.data || [],
    issues: issuesQuery.data || [],
    commits: commitsQuery.data || [],
    contributions: contributionsQuery.data || null,
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
