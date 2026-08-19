import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  Target,
  Code2,
  FolderGit2,
  Github,
  BookOpen,
  Network,
  Library,
  Layers,
  Sparkles,
  Shield,
  Briefcase,
  BarChart3,
  Settings,
  Command,
  Search,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useLearningEngine } from "@/features/learning/hooks/use-learning-engine";

const NAV = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/mission", label: "Today's Mission", icon: Target },
      { to: "/roadmap", label: "Learning Roadmap", icon: Map },
    ],
  },
  {
    label: "Practice",
    items: [
      { to: "/coding", label: "Coding Practice", icon: Code2 },
      { to: "/projects", label: "Projects", icon: FolderGit2 },
      { to: "/github", label: "GitHub", icon: Github },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { to: "/journal", label: "Learning Journal", icon: BookOpen },
      { to: "/knowledge", label: "Knowledge Graph", icon: Network },
      { to: "/books", label: "Books", icon: Library },
      { to: "/system-design", label: "System Design", icon: Layers },
      { to: "/ai", label: "AI Engineering", icon: Sparkles },
      { to: "/security", label: "Cyber Security", icon: Shield },
    ],
  },
  {
    label: "Career",
    items: [
      { to: "/interview", label: "Interview Prep", icon: Briefcase },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const userProfile = useAppStore(state => state.userProfile);
  const { data: learningEngine } = useLearningEngine();
  
  const currentPhase = learningEngine?.phases.find(
    (phase) => phase.isUnlocked && !phase.progress.isCompleted
  )?.title || "General Practice";

  const initials = userProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Engineering OS</div>
            <div className="text-[11px] text-muted-foreground">v1 · personal</div>
          </div>
        </div>

        <div className="px-3 pb-3">
          <button className="group flex w-full items-center gap-2 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-[12px] text-muted-foreground transition hover:bg-secondary">
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-hover:inline-flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">
          {NAV.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-secondary/40 px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-chart-3 text-[11px] font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12px] font-medium">{userProfile.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{currentPhase}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div
          className="min-h-screen"
          style={{ backgroundImage: "var(--gradient-glow)" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 px-8 pt-8 pb-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-primary/80">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="px-8 py-8">{children}</div>;
}