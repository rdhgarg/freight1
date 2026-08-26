import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Download, Search } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/stores/data";
import { useHydrated } from "@/hooks/use-hydrated";
import { aed, fmtDate, csvDownload } from "@/lib/format";
import { buildLedger } from "@/lib/invoice";
import type { LedgerRow } from "@/lib/invoice";

const TYPES = ["All", "Invoice", "Payment", "Expense", "Adjustment"] as const;

export const Route = createFileRoute("/_app/ledgers")({
  head: () => ({
    meta: [
      { title: "Ledgers — HAMS" },
      { name: "description", content: "Derived financial ledger — every invoice, payment and approved expense with running balance." },
      { property: "og:title", content: "Ledgers — HAMS" },
      { property: "og:description", content: "Derived financial ledger with running balance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ledgers;
});

function Ledgers() {
  const hydrated = useHydrated();
  const { workOrders, vendors, customers } = useData();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const all = useMemo(() => buildLedger(workOrders), [workOrders]);

  const filtered = useMemo(() => {
    const rows = all.filter((r) => {
      if (type !== "All" && r.type !== type) return false;
      if (from && r.date.slice(0, 10) < from) return false;
      if (to && r.date.slice(0, 10) > to) return false;
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      const cust = customers.find((c) => c.id === r.customerId)?.company ?? "";
      return (
        r.reference.toLowerCase().includes(t) ||
        r.woNumber.toLowerCase().includes(t) ||
        r.description.toLowerCase().includes(t) ||
        cust.toLowerCase().includes(t)
      );
    });
    let bal = 0;
    return rows.map((r) => {
      bal += r.debit - r.credit;
      return { ...r, balance: bal };
    });
  }, [all, type, from, to, q, customers]);

  const debits = filtered.reduce((s, r) => s + r.debit, 0);
  const credits = filtered.reduce((s, r) => s + r.credit, 0);

  if (!hydrated) return <div className="card-elevated h-64 animate-pulse" />;

  return (
    <div>
      <PageHeader
        title="Ledgers"
        description="Fully derived from work order invoices, receipts and approved expenses — every line traceable to its source record."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              csvDownload(
                "hams-ledger.csv",
                filtered.map((r) => ({
                  Date: fmtDate(r.date),
                  Type: r.type,
                  Reference: r.reference,
                  WorkOrder: r.woNumber,
                  Description: r.description,
                  Debit: r.debit,
                  Credit: r.credit,
                  Balance: r.balance,
                  By: r.by ?? "",
                })),
              )
            }
          >
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total debits" value={aed(debits)} icon={BookOpen} />
        <StatCard label="Total credits" value={aed(credits)} icon={BookOpen} />
        <StatCard label="Closing balance" value={aed(debits - credits)} icon={BookOpen} />
      </div>

      <div className="mt-4 card-elevated p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search reference, work order, customer…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All types" : t}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" className="w-[150px]" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="w-[150px]" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList>
          <TabsTrigger value="all">All transactions</TabsTrigger>
          <TabsTrigger value="wo">By work order</TabsTrigger>
          <TabsTrigger value="vendor">By vendor</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <LedgerTable rows={filtered} />
        </TabsContent>

        <TabsContent value="wo" className="mt-4 space-y-3">
          {groupBy(filtered, (r) => r.woId).length === 0 ? (
            <div className="card-elevated"><EmptyState icon={BookOpen} title="No transactions" /></div>
          ) : (
            groupBy(filtered, (r) => r.woId).map(([woId, rows]) => (
              <div key={woId} className="card-elevated overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                  <Link to="/work-orders/$id" params={{ id: woId }} className="text-sm font-semibold text-primary hover:underline">
                    {rows[0].woNumber}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    Net{" "}
                    <strong className={rows.reduce((s, r) => s + r.debit - r.credit, 0) > 0 ? "text-destructive" : "text-success"}>
                      {aed(rows.reduce((s, r) => s + r.debit - r.credit, 0))}
                    </strong>
                  </div>
                </div>
                <LedgerTable rows={runningBalance(rows)} bare />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="vendor" className="mt-4 space-y-3">
          {vendors.map((v) => {
            const rows = runningBalance(filtered.filter((r) => r.vendorId === v.id));
            if (rows.length === 0) return null;
            return (
              <div key={v.id} className="card-elevated overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                  <Link to="/vendors/$id" params={{ id: v.id }} className="text-sm font-semibold text-primary hover:underline">{v.name}</Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge status={v.category} />
                    Net <strong>{aed(rows.reduce((s, r) => s + r.debit - r.credit, 0))}</strong>
                  </div>
                </div>
                <LedgerTable rows={rows} bare />
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function runningBalance(rows: LedgerRow[]): LedgerRow[] {
  let b = 0;
  return rows.map((r) => {
    b += r.debit - r.credit;
    return { ...r, balance: b };
  });
}

function groupBy<T>(rows: T[], key: (r: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    map.set(k, [...(map.get(k) ?? []), r]);
  }
  return [...map.entries()];
}

function LedgerTable({ rows, bare }: { rows: LedgerRow[]; bare?: boolean }) {
  const body = rows.length === 0 ? (
    <EmptyState icon={BookOpen} title="No transactions match these filters" />
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Work order</th>
            <th className="px-4 py-3 font-medium">Particulars</th>
            <th className="px-4 py-3 font-medium text-right">Debit</th>
            <th className="px-4 py-3 font-medium text-right">Credit</th>
            <th className="px-4 py-3 font-medium text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
              <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.date)}</td>
              <td className="px-4 py-3"><StatusBadge status={r.type} /></td>
              <td className="px-4 py-3 font-mono text-xs">
                {r.type === "Invoice" || r.type === "Adjustment" ? (
                  <Link to="/invoices/$id" params={{ id: r.woId }} className="text-primary hover:underline">{r.reference}</Link>
                ) : (
                  r.reference
                )}
              </td>
              <td className="px-4 py-3">
                <Link to="/work-orders/$id" params={{ id: r.woId }} className="hover:underline">{r.woNumber}</Link>
              </td>
              <td className="px-4 py-3 max-w-[280px] truncate text-muted-foreground">{r.description}</td>
              <td className="px-4 py-3 text-right">{r.debit ? aed(r.debit) : "—"}</td>
              <td className="px-4 py-3 text-right">{r.credit ? aed(r.credit) : "—"}</td>
              <td className="px-4 py-3 text-right font-medium">{aed(r.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return bare ? body : <div className="card-elevated overflow-hidden">{body}</div>;
}
