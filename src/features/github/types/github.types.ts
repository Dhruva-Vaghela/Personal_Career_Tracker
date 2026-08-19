export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  email: string | null;
  twitter_username: string | null;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  fork: boolean;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GithubCommit {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  repository?: {
    name: string;
    full_name: string;
    html_url: string;
  };
  author?: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GithubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  repository_url: string;
  repo_name?: string;
  draft?: boolean;
  comments?: number;
}

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  repository_url: string;
  repo_name?: string;
  comments?: number;
  pull_request?: Record<string, unknown>;
}

export interface GithubEventPayload {
  action?: string;
  ref?: string;
  ref_type?: string;
  commits?: Array<{
    sha: string;
    message: string;
    url: string;
  }>;
  issue?: GithubIssue;
  pull_request?: GithubPullRequest;
  forkee?: GithubRepo;
}

export interface GithubEvent {
  id: string;
  type:
    | "PushEvent"
    | "PullRequestEvent"
    | "IssuesEvent"
    | "WatchEvent"
    | "CreateEvent"
    | "ForkEvent"
    | "IssueCommentEvent"
    | string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: GithubEventPayload;
  created_at: string;
}

export interface GithubContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubContributionWeek {
  days: GithubContributionDay[];
}

export interface GithubContributionCalendar {
  totalContributions: number;
  weeks: GithubContributionWeek[];
}

export interface GithubLanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface GithubAuthState {
  token: string | null;
  user: GithubUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface GithubApiError {
  message: string;
  documentation_url?: string;
  status?: number;
  rateLimitReset?: number;
}
