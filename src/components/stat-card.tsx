import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "info" | "destructive";
  className?: string;
}) {
  const tone = {
    primary: "text-primary bg-primary/10 ring-primary/25",
    success: "text-success bg-success/10 ring-success/25",
    warning: "text-warning bg-warning/10 ring-warning/25",
    info: "text-info bg-info/10 ring-info/25",
    destructive: "text-destructive bg-destructive/10 ring-destructive/25",
  }[accent];

  return (
    <div
      className={cn(
        "surface-panel group relative overflow-hidden p-4 transition hover:border-border/80",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md ring-1", tone)}>
          <Icon className="h-4 w-4" />
        </div>
        {hint && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-4 font-mono text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-panel p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="text-[13px] font-semibold tracking-tight text-foreground">{title}</h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}