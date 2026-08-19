import type {
  GithubUser,
  GithubRepo,
  GithubCommit,
  GithubPullRequest,
  GithubIssue,
  GithubEvent,
  GithubContributionCalendar,
  GithubContributionDay,
  GithubLanguageStat,
  GithubApiError,
} from "../types/github.types";

const GITHUB_API_BASE = "https://api.github.com";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dart: "#00B4AB",
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
    let rateLimitReset: number | undefined;

    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    const rateLimitResetHeader = response.headers.get("x-ratelimit-reset");

    if (rateLimitRemaining === "0" && rateLimitResetHeader) {
      rateLimitReset = parseInt(rateLimitResetHeader, 10);
      const resetDate = new Date(rateLimitReset * 1000).toLocaleTimeString();
      errorMessage = `GitHub API rate limit exceeded. Resets at ${resetDate}. Please connect an OAuth token or PAT for 5,000 req/hr.`;
    }

    try {
      const json = (await response.json()) as { message?: string; documentation_url?: string };
      if (json.message) {
        errorMessage = json.message;
      }
    } catch {
      // Keep status text error if JSON parsing fails
    }

    const error: GithubApiError = {
      message: errorMessage,
      status: response.status,
      rateLimitReset,
    };
    throw error;
  }
  return response.json() as Promise<T>;
}

function getHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = token.startsWith("bearer ") || token.startsWith("token ")
      ? token
      : `Bearer ${token}`;
  }
  return headers;
}

export const GithubApiService = {
  async fetchAuthenticatedUser(token: string): Promise<GithubUser> {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: getHeaders(token),
    });
    return handleResponse<GithubUser>(res);
  },

  async fetchUserRepos(token: string, username?: string): Promise<GithubRepo[]> {
    const endpoint = username
      ? `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed&type=all`
      : `${GITHUB_API_BASE}/user/repos?per_page=100&sort=pushed&type=all`;

    const res = await fetch(endpoint, {
      headers: getHeaders(token),
    });
    const repos = await handleResponse<GithubRepo[]>(res);
    return repos.filter((repo) => !repo.private);
  },

  async fetchUserEvents(token: string, username: string): Promise<GithubEvent[]> {
    const res = await fetch(`${GITHUB_API_BASE}/users/${username}/events?per_page=30`, {
      headers: getHeaders(token),
    });
    return handleResponse<GithubEvent[]>(res);
  },

  async fetchUserPullRequests(token: string, username: string): Promise<GithubPullRequest[]> {
    const res = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=author:${username}+type:pr&sort=updated&per_page=30`,
      { headers: getHeaders(token) },
    );
    const data = await handleResponse<{ items: Array<GithubIssue & { pull_request?: object }> }>(res);
    
    return data.items.map((item) => {
      const repoName = item.repository_url.replace(`${GITHUB_API_BASE}/repos/`, "");
      return {
        id: item.id,
        number: item.number,
        title: item.title,
        state: item.state === "closed" ? "merged" : "open",
        html_url: item.html_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
        closed_at: item.closed_at,
        merged_at: item.closed_at,
        user: item.user,
        repository_url: item.repository_url,
        repo_name: repoName,
        comments: item.comments,
      };
    });
  },

  async fetchUserIssues(token: string, username: string): Promise<GithubIssue[]> {
    const res = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=author:${username}+type:issue&sort=updated&per_page=30`,
      { headers: getHeaders(token) },
    );
    const data = await handleResponse<{ items: GithubIssue[] }>(res);
    return data.items.map((item) => ({
      ...item,
      repo_name: item.repository_url.replace(`${GITHUB_API_BASE}/repos/`, ""),
    }));
  },

  async fetchUserCommits(token: string, username: string, repos: GithubRepo[]): Promise<GithubCommit[]> {
    // Fetch recent commits across top active repos (max top 5)
    const topRepos = repos.filter((r) => !r.fork).slice(0, 5);
    if (topRepos.length === 0 && repos.length > 0) {
      topRepos.push(...repos.slice(0, 5));
    }

    const commitPromises = topRepos.map(async (repo) => {
      try {
        const res = await fetch(
          `${GITHUB_API_BASE}/repos/${repo.full_name}/commits?author=${username}&per_page=10`,
          { headers: getHeaders(token) },
        );
        if (!res.ok) return [];
        const commits = (await res.json()) as GithubCommit[];
        return commits.map((c) => ({
          ...c,
          repository: {
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
          },
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(commitPromises);
    const allCommits = results.flat();
    allCommits.sort(
      (a, b) =>
        new Date(b.commit.author.date).getTime() -
        new Date(a.commit.author.date).getTime(),
    );

    return allCommits.slice(0, 30);
  },

  async fetchContributionGraph(
    token: string,
    username: string,
  ): Promise<GithubContributionCalendar> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    try {
      const res = await fetch(`${GITHUB_API_BASE}/graphql`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ query, variables: { username } }),
      });

      if (res.ok) {
        const result = (await res.json()) as {
          data?: {
            user?: {
              contributionsCollection?: {
                contributionCalendar?: {
                  totalContributions: number;
                  weeks: Array<{
                    contributionDays: Array<{
                      date: string;
                      contributionCount: number;
                      color: string;
                    }>;
                  }>;
                };
              };
            };
          };
        };

        const cal = result.data?.user?.contributionsCollection?.contributionCalendar;
        if (cal) {
          return {
            totalContributions: cal.totalContributions,
            weeks: cal.weeks.map((w) => ({
              days: w.contributionDays.map((d) => {
                let level: 0 | 1 | 2 | 3 | 4 = 0;
                if (d.contributionCount > 0 && d.contributionCount <= 3) level = 1;
                else if (d.contributionCount > 3 && d.contributionCount <= 6) level = 2;
                else if (d.contributionCount > 6 && d.contributionCount <= 10) level = 3;
                else if (d.contributionCount > 10) level = 4;
                return {
                  date: d.date,
                  count: d.contributionCount,
                  level,
                };
              }),
            })),
          };
        }
      }
    } catch {
      // Fallback below
    }

    // Fallback to generating contribution calendar from events API if GraphQL is unavailable
    return this.generateFallbackContributionCalendar(token, username);
  },

  async generateFallbackContributionCalendar(
    token: string,
    username: string,
  ): Promise<GithubContributionCalendar> {
    const events = await this.fetchUserEvents(token, username).catch(() => []);
    const countMap: Record<string, number> = {};

    events.forEach((ev) => {
      const date = ev.created_at.split("T")[0];
      countMap[date] = (countMap[date] || 0) + 1;
    });

    const totalContributions = Object.values(countMap).reduce((a, b) => a + b, 0);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    const weeks: Array<{ days: GithubContributionDay[] }> = [];
    let currentWeek: GithubContributionDay[] = [];

    const curr = new Date(startDate);
    // Align start to preceding Sunday
    curr.setDate(curr.getDate() - curr.getDay());

    while (curr <= today) {
      const dateStr = curr.toISOString().split("T")[0];
      const count = countMap[dateStr] || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 8) level = 3;
      else if (count > 8) level = 4;

      currentWeek.push({ date: dateStr, count, level });

      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push({ days: currentWeek });
    }

    return { totalContributions, weeks };
  },

  calculateLanguageDistribution(repos: GithubRepo[]): GithubLanguageStat[] {
    const langCounts: Record<string, number> = {};
    let total = 0;

    repos.forEach((repo) => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        total += 1;
      }
    });

    if (total === 0) return [];

    return Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        bytes: count,
        percentage: Math.round((count / total) * 100),
        color: LANGUAGE_COLORS[name] || "#888888",
      }))
      .sort((a, b) => b.percentage - a.percentage);
  },

  getPinnedRepos(repos: GithubRepo[]): GithubRepo[] {
    // Sort by stargazers_count descending then pushed_at
    const sorted = [...repos].sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
    return sorted.slice(0, 6);
  },
};
