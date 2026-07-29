import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Truck, Warehouse, FileText, PackageSearch,
  Receipt, Wallet, BookOpen, AlertCircle, ClipboardList, Settings, Building2,
  ShieldCheck, UserCog,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { ModuleKey } from "@/lib/types";
import { useCurrentUser } from "@/stores/auth";
import { can } from "@/stores/rbac";

interface Item { title: string; url: string; icon: React.ComponentType<{ className?: string }>; module: ModuleKey }

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, module: "dashboard" }],
  },
  {
    label: "Operations",
    items: [
      { title: "Work Orders", url: "/work-orders", icon: ClipboardList, module: "workOrders" },
    ],
  },
  {
    label: "Masters",
    items: [
      { title: "Vendors", url: "/vendors", icon: Warehouse, module: "vendors" },
      { title: "Drivers", url: "/drivers", icon: UserCog, module: "drivers" },
      { title: "Fleet", url: "/fleet", icon: Truck, module: "fleet" },
    ],
  },
  {
    label: "Accounts",
    items: [
      { title: "Invoices", url: "/invoices", icon: FileText, module: "invoices" },
      { title: "Receipts", url: "/receipts", icon: Receipt, module: "receipts" },
      { title: "Outstanding", url: "/outstanding", icon: AlertCircle, module: "outstanding" },
      { title: "Expenses", url: "/expenses", icon: Wallet, module: "expenses" },
      { title: "Purchases", url: "/purchases", icon: PackageSearch, module: "purchases" },
      { title: "Ledgers", url: "/ledgers", icon: BookOpen, module: "ledgers" },
      { title: "Journal", url: "/journal", icon: BookOpen, module: "journal" },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Users", url: "/settings/users", icon: Users, module: "users" },
      { title: "Roles", url: "/settings/roles", icon: ShieldCheck, module: "roles" },
      { title: "Company", url: "/settings/company", icon: Building2, module: "settings" },
      { title: "Settings", url: "/settings", icon: Settings, module: "settings" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const user = useCurrentUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-primary text-white font-black shadow-glow">H</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-sidebar-foreground">HAMS</div>
              <div className="truncate text-[10px] uppercase tracking-widest text-sidebar-foreground/60">WO-Driven ERP</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => {
          const items = g.items.filter((i) => can(user?.role, i.module, "view"));
          if (!items.length) return null;
          return (
            <SidebarGroup key={g.label}>
              {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active = pathname === item.url || pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span className="truncate">{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-sidebar-foreground">{user.name}</div>
              <div className="truncate text-[10px] text-sidebar-foreground/60">{user.role}</div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
