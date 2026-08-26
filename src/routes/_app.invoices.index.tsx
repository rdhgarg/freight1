import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Search, Download } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/stores/data";
import { useHydrated } from "@/hooks/use-hydrated";
import { aed, fmtDate, csvDownload } from "@/lib/format";
import { woMoney } from "@/lib/wo";
import { invoiceDisplayStatus } from "@/lib/invoice";

const STATUSES = ["All", "Draft", "Issued", "Partially Paid", "Paid", "Overdue", "Cancelled"] as const;

export const Route = createFileRoute("/_app/invoices/")({
  head: () => ({
    meta: [
      { title: "Invoices — HAMS" },
      { name: "description", content: "All UAE tax invoices raised from work orders, with VAT, payments and outstanding." },
      { property: "og:title", content: "Invoices — HAMS" },
      { property: "og:description", content: "All UAE tax invoices raised from work orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvoiceList,
});

function InvoiceList() {
  const hydrated = useHydrated();
  const { workOrders, customers } = useData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("All");

  const rows = useMemo(
    () =>
      workOrders
        .filter((w) => w.invoice)
        .map((w) => {
          const m = woMoney(w);
          const inv = w.invoice!;
          return {
            wo: w,
            inv,
            customer: customers.find((c) => c.id === w.customerId),
            paid: inv.status === "Draft" || inv.status === "Cancelled" ? 0 : m.paid,
            balance: inv.status === "Draft" || inv.status === "Cancelled" ? 0 : m.balance,
            display: invoiceDisplayStatus(inv, m.paid),
          };
        })
        .sort((a, b) => b.inv.date.localeCompare(a.inv.date)),
    [workOrders, customers],
  );

  const filtered = rows.filter((r) => {
    if (status !== "All" && r.display !== status) return false;
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      r.inv.invoiceNo.toLowerCase().includes(t) ||
      r.wo.woNumber.toLowerCase().includes(t) ||
      (r.customer?.company ?? "").toLowerCase().includes(t)
    );
  });

  const live = rows.filter((r) => r.display !== "Draft" && r.display !== "Cancelled");
  const billed = live.reduce((s, r) => s + r.inv.total, 0);
  const collected = live.reduce((s, r) => s + r.paid, 0);
  const outstanding = live.reduce((s, r) => s + r.balance, 0);
  const overdue = live.filter((r) => r.display === "Overdue").reduce((s, r) => s + r.balance, 0);

  if (!hydrated) return <div className="card-elevated h-64 animate-pulse" />;

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Every tax invoice is raised from a work order — VAT, payments and outstanding stay in sync."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              csvDownload(
                "hams-invoices.csv",
                filtered.map((r) => ({
                  Invoice: r.inv.invoiceNo,
                  WorkOrder: r.wo.woNumber,
                  Customer: r.customer?.company ?? "",
                  TRN: r.customer?.gst ?? "",
                  Date: fmtDate(r.inv.date),
                  Due: fmtDate(r.inv.dueDate),
                  Subtotal: r.inv.subtotal,
                  VAT: r.inv.vatAmount,
                  Total: r.inv.total,
                  Received: r.paid,
                  Outstanding: r.balance,
                  Status: r.display,
                })),
              )
            }
          >
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total billed" value={aed(billed)} icon={FileText} />
        <StatCard label="Collected" value={aed(collected)} icon={FileText} />
        <StatCard label="Outstanding" value={aed(outstanding)} icon={FileText} />
        <StatCard label="Overdue" value={aed(overdue)} icon={FileText} />
      </div>

      <div className="mt-4 card-elevated p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search invoice no., work order or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mt-4 card-elevated overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Open a work order and create a draft invoice from the Invoice tab."
            action={<Link to="/work-orders"><Button size="sm">Go to work orders</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Work order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium text-right">VAT</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Outstanding</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.inv.invoiceNo} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link to="/invoices/$id" params={{ id: r.wo.id }} className="font-medium text-primary hover:underline">{r.inv.invoiceNo}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/work-orders/$id" params={{ id: r.wo.id }} className="hover:underline">{r.wo.woNumber}</Link>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{r.customer?.company ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.inv.date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{aed(r.inv.vatAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium">{aed(r.inv.total)}</td>
                    <td className={`px-4 py-3 text-right ${r.balance > 0 ? "font-semibold text-destructive" : "text-muted-foreground"}`}>{aed(r.balance)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.display} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
