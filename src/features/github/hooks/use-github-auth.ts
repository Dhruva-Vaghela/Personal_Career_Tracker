import { useState, useEffect, useCallback } from "react";
import { GithubCacheService } from "../services/github-cache.service";
import { GithubApiService } from "../services/github-api.service";
import {
  exchangeGithubCode,
  getGithubAuthUrl,
  getGithubConnectionServerFn,
  saveGithubConnectionServerFn,
  disconnectGithubServerFn,
} from "../services/github-oauth-fn";
import type { GithubUser, GithubAuthState } from "../types/github.types";

export function useGithubAuth() {
  const [authState, setAuthState] = useState<GithubAuthState>(() => {
    const token = GithubCacheService.getToken();
    const user = GithubCacheService.getCachedUser<GithubUser>();
    return {
      token,
      user,
      isLoading: true,
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

  // Restore connection from MongoDB and local storage on mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const localToken = GithubCacheService.getToken();
      const localUser = GithubCacheService.getCachedUser<GithubUser>();

      if (localToken && localUser && isMounted) {
        setAuthState({
          token: localToken,
          user: localUser,
          isLoading: false,
          error: null,
        });
      }

      try {
        const dbConn = await getGithubConnectionServerFn();
        if (!isMounted) return;

        if (dbConn.connected && dbConn.token && dbConn.user) {
          GithubCacheService.setToken(dbConn.token);
          GithubCacheService.setCachedUser(dbConn.user);
          setAuthState({
            token: dbConn.token,
            user: dbConn.user as GithubUser,
            isLoading: false,
            error: null,
          });
        } else if (!dbConn.connected && !localToken) {
          setAuthState({
            token: null,
            user: null,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        if (isMounted) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const verifyAndSaveToken = useCallback(async (token: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await GithubApiService.fetchAuthenticatedUser(token);

      // Save locally
      GithubCacheService.setToken(token);
      GithubCacheService.setCachedUser(user);

      // Save persistently in MongoDB
      await saveGithubConnectionServerFn({ data: { token, user } });

      setAuthState({
        token,
        user,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err: any) {
      const cachedUser = GithubCacheService.getCachedUser<GithubUser>();

      // Only set error message if server returned 401, but do NOT wipe session unless user disconnects
      if (err?.status === 401) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Invalid or expired GitHub token. Click 'Connect GitHub' to re-authenticate.",
        }));
        throw new Error("Invalid GitHub token");
      }

      // If offline, rate limited, or network error occurred, keep token and user session active!
      if (cachedUser || authState.user) {
        const activeUser = cachedUser || authState.user;
        setAuthState({
          token,
          user: activeUser,
          isLoading: false,
          error: err?.message || "Temporary GitHub network issue.",
        });
        return activeUser;
      }

      const msg = err?.message || "Failed to authenticate token with GitHub.";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: msg,
      }));
      throw new Error(msg);
    }
  }, [authState.user]);

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

  const disconnect = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // 1. Clear local cache
    GithubCacheService.removeToken();

    // 2. Clear persistent MongoDB record
    try {
      await disconnectGithubServerFn();
    } catch (err) {
      console.warn("Error disconnecting GitHub from database:", err);
    }

    // 3. Update state
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

