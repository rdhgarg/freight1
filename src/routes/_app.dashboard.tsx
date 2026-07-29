import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ClipboardList, Truck, Users, Wallet, FileText, AlertCircle, PackageCheck, CircleDollarSign,
} from "lucide-react";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, Legend, AreaChart, Area,
} from "recharts";
import { PageHeader, StatCard, StatusBadge } from "@/components/page-header";
import { useData } from "@/stores/data";
import { aed, fmtDate } from "@/lib/format";
import { WO_LIFECYCLE } from "@/lib/types";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HAMS" }] }),
  component: Dashboard,
});

const woTotal = (w: { containers: number; rate: number; taxPct?: number }) => {
  const sub = w.containers * w.rate;
  return sub + (sub * (w.taxPct ?? 0)) / 100;
};
const woPaid = (payments?: { amount: number }[]) => (payments ?? []).reduce((s, p) => s + p.amount, 0);
const woExp = (items?: { amount: number }[]) => (items ?? []).reduce((s, e) => s + e.amount, 0);

function Dashboard() {
  const { workOrders, customers, drivers, vendors } = useData();

  const kpis = useMemo(() => {
    const revenue = workOrders.reduce((s, w) => s + woTotal(w), 0);
    const paid = workOrders.reduce((s, w) => s + woPaid(w.payments), 0);
    const outstanding = revenue - paid;
    const totalExpenses = workOrders.reduce((s, w) => s + woExp(w.woExpenses), 0);
    const pendingOps = workOrders.filter((w) => !["Payment Received", "Closed", "Rejected", "Draft"].includes(w.status)).length;
    const closed = workOrders.filter((w) => w.status === "Closed" || w.status === "Payment Received").length;
    const draft = workOrders.filter((w) => w.status === "Draft").length;
    return { revenue, paid, outstanding, totalExpenses, pendingOps, closed, draft };
  }, [workOrders]);

  const revenueSeries = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const seed = (m.getMonth() + 1) * 137;
      return {
        month: months[m.getMonth()],
        revenue: 25000 + ((seed * 31) % 38000),
        expenses: 9000 + ((seed * 17) % 18000),
      };
    });
  }, []);

  const woStatusData = useMemo(
    () => WO_LIFECYCLE.map((s) => ({ name: s, value: workOrders.filter((w) => w.status === s).length })).filter((x) => x.value > 0),
    [workOrders],
  );

  const expenseData = useMemo(() => {
    const byCat = new Map<string, number>();
    workOrders.forEach((w) => (w.woExpenses ?? []).forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount)));
    return Array.from(byCat, ([name, total]) => ({ name, total }));
  }, [workOrders]);

  const colors = ["oklch(0.55 0.18 255)", "oklch(0.65 0.15 180)", "oklch(0.7 0.17 75)", "oklch(0.62 0.2 320)", "oklch(0.6 0.2 25)", "oklch(0.62 0.14 230)", "oklch(0.68 0.16 155)", "oklch(0.5 0.18 300)"];

  return (
    <div>
      <PageHeader title="Executive Dashboard" description="Work-order driven overview of your logistics operation." />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="WO Revenue" value={aed(kpis.revenue)} delta="Lifetime" icon={CircleDollarSign} tone="primary" to="/work-orders" />
        <StatCard label="Outstanding" value={aed(kpis.outstanding)} delta={`${aed(kpis.paid)} received`} icon={AlertCircle} tone="warning" to="/outstanding" />
        <StatCard label="Total Expenses" value={aed(kpis.totalExpenses)} delta="Across WOs" icon={Wallet} tone="destructive" to="/expenses" />
        <StatCard label="Pending Ops" value={String(kpis.pendingOps)} delta={`${kpis.draft} in draft`} icon={ClipboardList} tone="info" to="/work-orders" />
        <StatCard label="Closed WOs" value={String(kpis.closed)} delta="Completed" icon={PackageCheck} tone="success" to="/work-orders" />
        <StatCard label="Active Drivers" value={String(drivers.filter((d) => d.status !== "Off Duty").length)} delta={`of ${drivers.length}`} icon={Truck} tone="success" to="/drivers" />
        <StatCard label="Vendors" value={String(vendors.filter((v) => v.status === "Active").length)} delta="Active" icon={Users} tone="info" to="/vendors" />
        <StatCard label="Total WOs" value={String(workOrders.length)} delta={`${customers.length} customers`} icon={FileText} tone="primary" to="/work-orders" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4 lg:col-span-2">
          <div className="text-sm font-semibold">Revenue vs Expenses</div>
          <div className="text-xs text-muted-foreground">Last 6 months (AED)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 255)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 255)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="currentColor" fontSize={11} />
                <YAxis stroke="currentColor" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => aed(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.18 255)" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="expenses" stroke="oklch(0.6 0.2 25)" strokeWidth={2} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-elevated p-4">
          <div className="text-sm font-semibold">WO Status Distribution</div>
          <div className="text-xs text-muted-foreground">Current pipeline</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={woStatusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {woStatusData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recent Work Orders</div>
              <div className="text-xs text-muted-foreground">Latest activity</div>
            </div>
            <Link to="/work-orders" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 font-medium">WO</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.slice(0, 6).map((w) => {
                  const c = customers.find((x) => x.id === w.customerId);
                  return (
                    <tr key={w.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                      <td className="py-2.5">
                        <Link to="/work-orders/$id" params={{ id: w.id }} className="font-medium text-primary hover:underline">{w.woNumber}</Link>
                        <div className="text-[11px] text-muted-foreground">{fmtDate(w.createdAt)}</div>
                      </td>
                      <td className="py-2.5 text-xs truncate max-w-[220px]">{c?.company ?? "—"}</td>
                      <td className="py-2.5 font-medium">{aed(woTotal(w))}</td>
                      <td className="py-2.5"><StatusBadge status={w.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4">
          <div className="text-sm font-semibold">Expenses by Category</div>
          <div className="text-xs text-muted-foreground">Across all WOs</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={expenseData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="currentColor" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="currentColor" fontSize={10} width={90} />
                <Tooltip formatter={(v) => aed(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="total" fill="oklch(0.55 0.18 255)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
