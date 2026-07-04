import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 pb-4"
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground truncate">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({
  label, value, delta, icon: Icon, to, tone = "primary",
}: {
  label: string; value: string; delta?: string; icon: LucideIcon; to?: string;
  tone?: "primary" | "success" | "warning" | "info" | "destructive";
}) {
  const toneMap: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    success: "from-success/15 to-success/5 text-success",
    warning: "from-warning/20 to-warning/5 text-warning",
    info: "from-info/15 to-info/5 text-info",
    destructive: "from-destructive/15 to-destructive/5 text-destructive",
  };
  const inner = (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-elevated card-elevated-hover p-4 cursor-pointer h-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
          <div className="mt-1 text-2xl font-bold truncate">{value}</div>
          {delta && <div className="mt-1 text-[11px] text-muted-foreground">{delta}</div>}
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s.includes("delivered") || s.includes("paid") || s.includes("approved") || s === "active" || s === "available"
      ? "bg-success/15 text-success border-success/30"
      : s.includes("pending") || s.includes("draft") || s.includes("partial") || s.includes("transit") || s.includes("on trip")
      ? "bg-warning/20 text-warning border-warning/40"
      : s.includes("overdue") || s.includes("reject") || s.includes("inactive") || s.includes("off duty")
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : s.includes("converted") || s.includes("sent")
      ? "bg-info/15 text-info border-info/30"
      : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}
