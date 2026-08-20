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

export const getGithubAuthUrl = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ url: string | null; clientIdConfigured: boolean }> => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL || "http://localhost:8080/auth/github/callback";

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

