import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, Sun, User as UserIcon, KeyRound, Home, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useCurrentUser } from "@/stores/auth";
import { useUI } from "@/stores/ui";
import { useMemo } from "react";
import { toast } from "sonner";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  drivers: "Drivers",
  vendors: "Vendors",
  fleet: "Fleet",
  "work-orders": "Work Orders",
  expenses: "Expenses",
  purchases: "Purchases",
  invoices: "Invoices",
  receipts: "Receipts",
  ledgers: "Ledgers",
  outstanding: "Outstanding",
  journal: "Journal",
  settings: "Settings",
  users: "Users",
  roles: "Roles",
  company: "Company",
  new: "New",
  edit: "Edit",
  profile: "Profile",
  "change-password": "Change Password",
};

export function Topbar() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const out: { label: string; href: string }[] = [];
    parts.forEach((p, i) => {
      const href = "/" + parts.slice(0, i + 1).join("/");
      out.push({ label: LABELS[p] ?? p, href });
    });
    return out;
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground shrink-0">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="h-3 w-3 shrink-0" />
            {i === crumbs.length - 1 ? (
              <span className="truncate text-foreground font-medium">{c.label}</span>
            ) : (
              <Link to={c.href} className="truncate hover:text-foreground">{c.label}</Link>
            )}
          </span>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search work orders, vendors…" className="w-72 pl-8" onKeyDown={(e) => {
            if (e.key === "Enter") toast.info("Global search coming soon");
          }} />
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-xs font-medium">Invoice INV-2026-0003 overdue</span>
              <span className="text-[11px] text-muted-foreground">2 days ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-xs font-medium">Truck TS 09 GH 3456 insurance expired</span>
              <span className="text-[11px] text-muted-foreground">Today</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-xs font-medium">Work Order WO-2026-0004 pending approval</span>
              <span className="text-[11px] text-muted-foreground">5h ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="grid h-7 w-7 place-items-center rounded-full gradient-primary text-white text-xs font-bold">
                {user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"}
              </div>
              <span className="hidden sm:block text-sm">{user?.name ?? "Guest"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user?.name}</span>
              <span className="text-[11px] font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/profile/change-password" })}>
              <KeyRound className="mr-2 h-4 w-4" /> Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
