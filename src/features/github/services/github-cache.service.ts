const GITHUB_TOKEN_KEY = "eos_github_access_token";
const GITHUB_USER_CACHE_KEY = "eos_github_user_cache";
const GITHUB_DASHBOARD_CACHE_KEY = "eos_github_dashboard_cache";

export const GithubCacheService = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(GITHUB_TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GITHUB_TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GITHUB_TOKEN_KEY);
    localStorage.removeItem(GITHUB_USER_CACHE_KEY);
    localStorage.removeItem(GITHUB_DASHBOARD_CACHE_KEY);
  },

  getCachedUser<T>(): T | null {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(GITHUB_USER_CACHE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  },

  setCachedUser<T>(user: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GITHUB_USER_CACHE_KEY, JSON.stringify(user));
  },

  getCachedDashboardData<T>(): T | null {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(GITHUB_DASHBOARD_CACHE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  },

  setCachedDashboardData<T>(data: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GITHUB_DASHBOARD_CACHE_KEY, JSON.stringify(data));
  },
};
