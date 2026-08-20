import { useState, useEffect, useCallback } from "react";
import { GithubCacheService } from "../services/github-cache.service";
import { GithubApiService } from "../services/github-api.service";
import { exchangeGithubCode, getGithubAuthUrl } from "../services/github-oauth-fn";
import type { GithubUser, GithubAuthState } from "../types/github.types";

export function useGithubAuth() {
  const [authState, setAuthState] = useState<GithubAuthState>(() => {
    const token = GithubCacheService.getToken();
    const user = GithubCacheService.getCachedUser<GithubUser>();
    return {
      token,
      user,
      isLoading: Boolean(token && !user),
      error: null,
    };
  });

  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isOAuthAvailable, setIsOAuthAvailable] = useState<boolean>(false);

  // Initialize OAuth URL dynamically matching current site origin (deployed URL or localhost)
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUri = origin ? `${origin}/auth/github/callback` : undefined;

    getGithubAuthUrl({ data: { redirectUri } })
      .then((res) => {
        setAuthUrl(res.url);
        setIsOAuthAvailable(res.clientIdConfigured);
      })
      .catch(() => {
        setIsOAuthAvailable(false);
      });
  }, []);

  const verifyAndSaveToken = useCallback(async (token: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await GithubApiService.fetchAuthenticatedUser(token);
      GithubCacheService.setToken(token);
      GithubCacheService.setCachedUser(user);
      setAuthState({
        token,
        user,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err: any) {
      const cachedUser = GithubCacheService.getCachedUser<GithubUser>();
      // Only remove token if server explicitly returned 401 Unauthorized
      if (err?.status === 401) {
        GithubCacheService.removeToken();
        setAuthState({
          token: null,
          user: null,
          isLoading: false,
          error: "Invalid GitHub token. Please re-authenticate.",
        });
        throw new Error("Invalid GitHub token");
      }

      // If offline, rate limited, or network error occurred, keep cached token and user session active
      if (cachedUser) {
        setAuthState({
          token,
          user: cachedUser,
          isLoading: false,
          error: err?.message || null,
        });
        return cachedUser;
      }

      const msg = err?.message || "Failed to authenticate token with GitHub.";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: msg,
      }));
      throw new Error(msg);
    }
  }, []);

  // Handle OAuth authorization code if present in URL
  const handleOAuthCode = useCallback(
    async (code: string) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await exchangeGithubCode({ data: { code } });
        if (response.access_token) {
          await verifyAndSaveToken(response.access_token);
        } else {
          throw new Error("No access token returned from OAuth exchange.");
        }
      } catch (err: any) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: err?.message || "Failed to exchange OAuth code.",
        }));
      }
    },
    [verifyAndSaveToken],
  );

  // Verify token on mount if present
  useEffect(() => {
    const token = GithubCacheService.getToken();
    if (token) {
      verifyAndSaveToken(token).catch(() => {
        // Handled inside verifyAndSaveToken
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [verifyAndSaveToken]);

  const disconnect = useCallback(() => {
    GithubCacheService.removeToken();
    setAuthState({
      token: null,
      user: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const connectWithToken = useCallback(
    async (token: string) => {
      return verifyAndSaveToken(token.trim());
    },
    [verifyAndSaveToken],
  );

  return {
    ...authState,
    authUrl,
    isOAuthAvailable,
    connectWithToken,
    handleOAuthCode,
    disconnect,
    refetchUser: () => authState.token && verifyAndSaveToken(authState.token),
  };
}

