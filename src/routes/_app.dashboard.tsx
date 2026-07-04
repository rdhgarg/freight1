import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Container, Truck, Users, Wallet, FileText, AlertCircle, PackageCheck, IndianRupee,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, Legend, AreaChart, Area,
} from "recharts";
import { PageHeader, StatCard, StatusBadge } from "@/components/page-header";
import { useData } from "@/stores/data";
import { inr, fmtDate } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HAMS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { shipments, customers, drivers, invoices, expenses } = useData();

  const kpis = useMemo(() => {
    const delivered = shipments.filter((s) => s.stage === "Delivered");
    const ongoing = shipments.filter((s) => s.stage !== "Delivered");
    const revenue = shipments.reduce((sum, s) => sum + s.amount, 0);
    const outstanding = invoices.reduce((sum, i) => sum + (i.total - i.paid), 0);
    const pendingPayments = invoices.filter((i) => i.status !== "Paid").length;
    const activeDrivers = drivers.filter((d) => d.status !== "Off Duty").length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { delivered, ongoing, revenue, outstanding, pendingPayments, activeDrivers, totalExpenses };
  }, [shipments, invoices, drivers, expenses]);

  const revenueSeries = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = months[m.getMonth()];
      const seed = (m.getMonth() + 1) * 137;
      return {
        month: label,
        revenue: 250000 + ((seed * 31) % 380000),
        expenses: 90000 + ((seed * 17) % 180000),
      };
    });
  }, []);

  const shipmentStatusData = useMemo(() => {
    const stages = ["Customs Clearance", "Driver Assignment", "Port Activity", "Inspection", "X-Ray", "Out From Port", "In Transit", "Delivered"];
    return stages.map((s) => ({ name: s, value: shipments.filter((x) => x.stage === s).length }));
  }, [shipments]);

  const expenseData = useMemo(
    () => EXPENSE_CATEGORIES.map((c) => ({ name: c, total: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) })),
    [expenses],
  );

  const colors = ["oklch(0.55 0.18 255)", "oklch(0.65 0.15 180)", "oklch(0.7 0.17 75)", "oklch(0.62 0.2 320)", "oklch(0.6 0.2 25)", "oklch(0.62 0.14 230)", "oklch(0.68 0.16 155)", "oklch(0.5 0.18 300)"];

  return (
    <div>
      <PageHeader title="Executive Dashboard" description="Live overview of your logistics operation." />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completed Shipments" value={String(kpis.delivered.length)} delta="This month" icon={PackageCheck} tone="success" to="/shipments" />
        <StatCard label="Ongoing Shipments" value={String(kpis.ongoing.length)} delta="In pipeline" icon={Container} tone="info" to="/shipments" />
        <StatCard label="Shipment Revenue" value={inr(kpis.revenue)} delta="Lifetime" icon={IndianRupee} tone="primary" to="/invoices" />
        <StatCard label="Outstanding" value={inr(kpis.outstanding)} delta={`${kpis.pendingPayments} pending`} icon={AlertCircle} tone="warning" to="/outstanding" />
        <StatCard label="Total Customers" value={String(customers.length)} delta={`${customers.filter((c) => c.status === "Active").length} active`} icon={Users} tone="info" to="/customers" />
        <StatCard label="Active Drivers" value={String(kpis.activeDrivers)} delta={`of ${drivers.length}`} icon={Truck} tone="success" to="/drivers" />
        <StatCard label="Total Expenses" value={inr(kpis.totalExpenses)} delta="All time" icon={Wallet} tone="destructive" to="/expenses" />
        <StatCard label="Invoices Raised" value={String(invoices.length)} delta={`${invoices.filter((i) => i.status === "Paid").length} paid`} icon={FileText} tone="primary" to="/invoices" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold">Revenue vs Expenses</div>
              <div className="text-xs text-muted-foreground">Last 6 months</div>
            </div>
          </div>
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
                <Tooltip formatter={(v) => inr(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.18 255)" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="expenses" stroke="oklch(0.6 0.2 25)" strokeWidth={2} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-elevated p-4">
          <div className="text-sm font-semibold">Shipment Status</div>
          <div className="text-xs text-muted-foreground">Current distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={shipmentStatusData.filter((s) => s.value > 0)} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {shipmentStatusData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
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
              <div className="text-sm font-semibold">Recent Shipments</div>
              <div className="text-xs text-muted-foreground">Latest activity</div>
            </div>
            <Link to="/shipments" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 font-medium">Shipment</th>
                  <th className="py-2 font-medium">Route</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shipments.slice(0, 5).map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="py-2.5">
                      <Link to="/shipments/$id" params={{ id: s.id }} className="font-medium text-primary hover:underline">
                        {s.shipmentNo}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">{fmtDate(s.createdAt)}</div>
                    </td>
                    <td className="py-2.5 text-xs">
                      <div className="truncate max-w-[220px]">{s.pickup}</div>
                      <div className="truncate max-w-[220px] text-muted-foreground">→ {s.delivery}</div>
                    </td>
                    <td className="py-2.5 font-medium">{inr(s.amount)}</td>
                    <td className="py-2.5"><StatusBadge status={s.stage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4">
          <div className="text-sm font-semibold">Expense Distribution</div>
          <div className="text-xs text-muted-foreground">By category</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={expenseData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="currentColor" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="currentColor" fontSize={10} width={90} />
                <Tooltip formatter={(v) => inr(Number(v))} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="total" fill="oklch(0.55 0.18 255)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
