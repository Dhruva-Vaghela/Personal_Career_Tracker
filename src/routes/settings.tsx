import { createFileRoute, Link } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/app-shell";
import { Panel } from "@/components/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Github, CheckCircle2, Download, Upload } from "lucide-react";
import { useGithubAuth } from "@/features/github/hooks/use-github-auth";
import { useAppStore } from "@/store/app-store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Engineering OS" },
      { name: "description", content: "Preferences, integrations, appearance." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, disconnect } = useGithubAuth();
  const userProfile = useAppStore(state => state.userProfile);
  const updateUserProfile = useAppStore(state => state.updateUserProfile);

  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState(userProfile.role);

  const handleSaveProfile = () => {
    updateUserProfile({ name, role });
    toast.success("Profile saved successfully");
  };

  const handleExportData = () => {
    const data = localStorage.getItem("engineeros-storage");
    if (!data) {
      toast.error("No data found to export");
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engineeros-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        // Validate JSON
        JSON.parse(json);
        localStorage.setItem("engineeros-storage", json);
        toast.success("Data imported successfully. Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings" description="Tune the OS to your workflow." />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Profile">
            <div className="grid gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Display name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 bg-background/40" />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Goal role</Label>
                <Input value={role} onChange={e => setRole(e.target.value)} className="mt-1 bg-background/40" />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">GitHub Profile</Label>
                <Input
                  defaultValue={user ? `github.com/${user.login}` : ""}
                  placeholder="github.com/username"
                  className="mt-1 bg-background/40"
                  readOnly={Boolean(user)}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={handleSaveProfile}>Save Profile</Button>
              </div>
            </div>
          </Panel>

          <Panel title="Data Management">
            <div className="space-y-4">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Engineering OS runs entirely in your browser. Your data is not sent to any external server except for API calls to your configured AI provider and GitHub.
              </p>
              
              <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                <Button onClick={handleExportData} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Export Backup
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="secondary" className="gap-2 pointer-events-none">
                    <Upload className="h-4 w-4" /> Import Backup
                  </Button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Practice preferences" className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-x-8">
              {[
                { k: "Daily mission notifications", d: "Nudge me at 9:00 AM" },
                { k: "Weekly AI summary", d: "Every Sunday, from journal + coding" },
                { k: "Honesty mode", d: "Warn if AI usage exceeds 60%" },
                { k: "Deep work mute", d: "Disable non-essential UI during timer" },
              ].map((s, i) => (
                <div key={s.k} className="flex items-center justify-between border-b border-border/60 py-3 last:border-0 md:[&:nth-last-child(2)]:border-0">
                  <div>
                    <div className="text-[13px] font-medium">{s.k}</div>
                    <div className="text-[11.5px] text-muted-foreground">{s.d}</div>
                  </div>
                  <Switch defaultChecked={i !== 3} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Integrations" className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              {/* Real GitHub Integration Card */}
              <div className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                    <Github className="h-4 w-4" /> GitHub
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {user ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Connected as @{user.login}
                      </span>
                    ) : (
                      "Not connected"
                    )}
                  </div>
                </div>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link to="/github" search={{ code: undefined }}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Dashboard
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={disconnect} className="text-xs text-destructive">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Link to="/github" search={{ code: undefined }}>
                    <Button size="sm" variant="secondary">
                      Connect
                    </Button>
                  </Link>
                )}
              </div>

              {/* Other Integrations */}
              {["LeetCode", "Notion"].map((s) => (
                <div key={s} className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3">
                  <div>
                    <div className="text-[13px] font-semibold">{s}</div>
                    <div className="text-[11.5px] text-muted-foreground">Not connected</div>
                  </div>
                  <Button size="sm" variant="secondary">Connect</Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </PageBody>
    </>
  );
}