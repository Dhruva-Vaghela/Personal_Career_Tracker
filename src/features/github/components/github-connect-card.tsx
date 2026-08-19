import React, { useState } from "react";
import { Github, Key, ExternalLink, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/stat-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GithubConnectCardProps {
  authUrl: string | null;
  isOAuthAvailable: boolean;
  onConnectToken: (token: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function GithubConnectCard({
  authUrl,
  isOAuthAvailable,
  onConnectToken,
  isLoading,
  error,
}: GithubConnectCardProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [patError, setPatError] = useState<string | null>(null);

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setPatError("Please enter a valid GitHub token.");
      return;
    }
    setPatError(null);
    setSubmitting(true);
    try {
      await onConnectToken(tokenInput);
    } catch (err: any) {
      setPatError(err?.message || "Failed to connect using token.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <Panel title="Connect GitHub Account">
        <div className="space-y-6 p-2">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Connect your real GitHub workspace
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Engineering OS directly integrates with your GitHub repositories, pull requests,
                issues, commits, and contribution heatmap using secure GitHub APIs.
              </p>
            </div>
          </div>

          {(error || patError) && (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Connection Error</AlertTitle>
              <AlertDescription className="text-xs">{error || patError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={isOAuthAvailable ? "oauth" : "pat"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth" className="gap-2 text-xs">
                <Github className="h-3.5 w-3.5" /> GitHub OAuth
              </TabsTrigger>
              <TabsTrigger value="pat" className="gap-2 text-xs">
                <Key className="h-3.5 w-3.5" /> Personal Access Token
              </TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="mt-4 space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> OAuth Scope & Authorization
                </div>
                <p className="mt-1.5 leading-relaxed">
                  Clicking authorization will open GitHub. Permissions requested: <code className="text-foreground">read:user</code>, <code className="text-foreground">repo</code>, and <code className="text-foreground">user:email</code>.
                </p>
              </div>

              {authUrl ? (
                <Button
                  className="w-full gap-2 font-medium"
                  size="default"
                  onClick={() => {
                    window.location.href = authUrl;
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                  Authorize with GitHub OAuth
                </Button>
              ) : (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                  GitHub OAuth App Client ID is not configured in <code className="font-mono">.env</code>. You can instantly connect below using a Personal Access Token!
                </div>
              )}
            </TabsContent>

            <TabsContent value="pat" className="mt-4 space-y-4">
              <form onSubmit={handlePatSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-xs font-medium">
                    GitHub Personal Access Token (PAT) / Access Token
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="ghp_... or github_pat_..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
                  <div className="font-medium text-foreground flex items-center justify-between">
                    <span>How to create a PAT:</span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=read:user,repo,user:email&description=EngineeringOS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Generate token on GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p>Required scopes: <span className="font-mono text-foreground">read:user</span>, <span className="font-mono text-foreground">repo</span>, <span className="font-mono text-foreground">user:email</span></p>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 text-xs font-medium"
                  disabled={submitting || isLoading}
                >
                  {submitting || isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Connect with Token
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Panel>
    </div>
  );
}
