import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/stores/data";
import { inr, fmtDate, csvDownload } from "@/lib/format";
import { Plus, Download, ClipboardList, Search } from "lucide-react";

export const Route = createFileRoute("/_app/work-orders/")({
  head: () => ({ meta: [{ title: "Work Orders — HAMS" }] }),
  component: WorkOrdersList,
});

const STATUSES = ["All","Draft","Submitted","Under Review","Pending Approval","Approved","Ready for Operations","Dispatch Pending","Trip Created","Converted","Completed","Closed","Sent Back","Rejected"];

function WorkOrdersList() {
  const nav = useNavigate();
  const { workOrders, customers } = useData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    return workOrders.filter((w) => {
      if (status !== "All" && w.status !== status) return false;
      if (!q) return true;
      const c = customers.find((x) => x.id === w.customerId);
      const s = `${w.woNumber} ${c?.company ?? ""} ${w.customerRef ?? ""} ${w.pickup} ${w.delivery} ${w.blNumber ?? ""}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [workOrders, customers, q, status]);

  const exportCsv = () => {
    csvDownload("work-orders.csv", rows.map((w) => ({
      WO: w.woNumber, Customer: customers.find((c) => c.id === w.customerId)?.company ?? "",
      Ref: w.customerRef ?? "", Containers: w.containers, Rate: w.rate,
      Pickup: w.pickup, Delivery: w.delivery, Status: w.status, Created: fmtDate(w.createdAt),
    })));
  };

  return (
    <div>
      <PageHeader title="Work Orders" description={`${workOrders.length} total`} actions={
        <>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          <Button size="sm" onClick={() => nav({ to: "/work-orders/new" })}><Plus className="h-4 w-4 mr-1.5" /> New WO</Button>
        </>
      } />
      <div className="card-elevated p-3 mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search WO, customer, BL, route…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="card-elevated overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No work orders" action={<Button size="sm" onClick={() => nav({ to: "/work-orders/new" })}>Create first WO</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">WO #</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium text-right">Cont.</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => {
                  const c = customers.find((x) => x.id === w.customerId);
                  return (
                    <tr key={w.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link to="/work-orders/$id" params={{ id: w.id }} className="text-primary hover:underline font-medium">{w.woNumber}</Link>
                        <div className="text-[11px] text-muted-foreground font-mono">{w.customerRef}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium truncate max-w-[180px]">{c?.company ?? "—"}</div>
                        <div className="text-[11px] text-muted-foreground">{w.containerType ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="truncate max-w-[220px]">{w.pickup}</div>
                        <div className="truncate max-w-[220px] text-muted-foreground">→ {w.delivery}</div>
                      </td>
                      <td className="px-4 py-3 text-right">{w.containers}</td>
                      <td className="px-4 py-3 text-right font-medium">{inr(w.containers * w.rate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={w.priority ?? "Normal"} /></td>
                      <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmtDate(w.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
