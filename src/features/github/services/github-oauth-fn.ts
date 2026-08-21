import { createServerFn } from "@tanstack/react-start";

interface ExchangeCodePayload {
  code: string;
}

interface ExchangeCodeResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

export const exchangeGithubCode = createServerFn({ method: "POST" })
  .validator((data: ExchangeCodePayload) => data)
  .handler(async ({ data }): Promise<ExchangeCodeResponse> => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "GitHub Client ID or Secret is missing in server environment variables.",
      );
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: data.code,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to exchange authorization code with GitHub: ${response.statusText}`,
      );
    }

    const json = (await response.json()) as ExchangeCodeResponse;

    if (json.error) {
      throw new Error(
        json.error_description || json.error || "GitHub OAuth authorization failed.",
      );
    }

    return json;
  });

interface GetAuthUrlPayload {
  redirectUri?: string;
}

export const getGithubAuthUrl = createServerFn({ method: "GET" })
  .validator((data?: GetAuthUrlPayload) => data)
  .handler(
    async ({ data }): Promise<{ url: string | null; clientIdConfigured: boolean }> => {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const fallbackCallback = "http://localhost:8080/auth/github/callback";
      const redirectUri = process.env.GITHUB_CALLBACK_URL || data?.redirectUri || fallbackCallback;

      if (!clientId) {
        return { url: null, clientIdConfigured: false };
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "read:user,repo,user:email",
      });

      return {
        url: `https://github.com/login/oauth/authorize?${params.toString()}`,
        clientIdConfigured: true,
      };
    },
  );

export interface SaveConnectionPayload {
  token: string;
  user: any;
}

export const saveGithubConnectionServerFn = createServerFn({ method: "POST" })
  .validator((data: SaveConnectionPayload) => data)
  .handler(async ({ data }) => {
    try {
      const { getMongoDb } = await import("@/lib/mongodb");
      const db = await getMongoDb();
      await db.collection("github_connections").updateOne(
        { id: "single_user_github" },
        {
          $set: {
            id: "single_user_github",
            connected: true,
            accessToken: data.token,
            userProfile: data.user,
            username: data.user?.login || "",
            githubUserId: String(data.user?.id || ""),
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            connectedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      return { success: true };
    } catch (err: any) {
      console.warn("MongoDB connection save warning:", err.message);
      return { success: false, error: err.message };
    }
  });

export const getGithubConnectionServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getMongoDb } = await import("@/lib/mongodb");
      const db = await getMongoDb();
      const doc = await db.collection("github_connections").findOne({ id: "single_user_github" });
      if (!doc || !doc.connected || !doc.accessToken) {
        return { connected: false, token: null, user: null };
      }
      return {
        connected: true,
        token: doc.accessToken as string,
        user: doc.userProfile || null,
        username: (doc.username as string) || (doc.userProfile?.login as string) || "",
      };
    } catch (err: any) {
      console.warn("MongoDB connection get warning:", err.message);
      return { connected: false, token: null, user: null, error: err.message };
    }
  });

export const disconnectGithubServerFn = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { getMongoDb } = await import("@/lib/mongodb");
      const db = await getMongoDb();
      await db.collection("github_connections").updateOne(
        { id: "single_user_github" },
        {
          $set: {
            connected: false,
            accessToken: null,
            updatedAt: new Date().toISOString(),
          },
        }
      );
      return { success: true };
    } catch (err: any) {
      console.warn("MongoDB connection disconnect warning:", err.message);
      return { success: false, error: err.message };
    }
  });


