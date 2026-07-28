import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/stores/data";
import { inr, fmtDate } from "@/lib/format";
import { Edit3, FileX, Mail, Phone, MapPin, Star, Building2, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/vendors/$id/")({
  head: () => ({ meta: [{ title: "Vendor — HAMS" }] }),
  component: VendorDetail,
});

function VendorDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { vendors, workOrders, purchases, customers } = useData();
  const v = vendors.find((x) => x.id === id);
  if (!v) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Vendor not found" action={<Button onClick={() => nav({ to: "/vendors" })}>Back</Button>} /></div>;

  const jobs = workOrders.filter((w) => w.primaryVendorId === id);
  const done = jobs.filter((w) => ["Completed","Closed","Trip Created","Converted"].includes(w.status));
  const bills = purchases.filter((p) => p.supplierId === id);
  const totalBilled = bills.reduce((s, p) => s + p.amount, 0);
  const outstanding = bills.reduce((s, p) => s + (p.amount - p.paidAmount), 0);

  return (
    <div>
      <PageHeader title={v.name} description={`${v.code} · ${v.category}`} actions={
        <>
          <StatusBadge status={v.status} />
          <Button size="sm" variant="outline" onClick={() => nav({ to: "/vendors/$id/edit", params: { id } })}><Edit3 className="h-4 w-4 mr-1.5" /> Edit</Button>
        </>
      } />
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2"><Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span>{v.contactName}</span></div>
              <div className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span>{v.contactPhone}</span></div>
              <div className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span className="break-all">{v.contactEmail}</span></div>
              <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span>{v.address}</span></div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terms</div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Payment</dt><dd>{v.paymentTerms}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">GST</dt><dd className="font-mono text-xs">{v.gst}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Rating</dt><dd className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {v.rating?.toFixed(1) ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Services</dt><dd className="text-right max-w-[60%]">{v.services}</dd></div>
            </dl>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performance</div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Jobs assigned</dt><dd className="font-semibold">{jobs.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Completed</dt><dd className="font-semibold text-success">{done.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total billed</dt><dd className="font-semibold">{inr(totalBilled)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Outstanding</dt><dd className={`font-semibold ${outstanding > 0 ? "text-destructive" : ""}`}>{inr(outstanding)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="wos">
            <TabsList>
              <TabsTrigger value="wos">Work Orders ({jobs.length})</TabsTrigger>
              <TabsTrigger value="bills">Bills ({bills.length})</TabsTrigger>
              <TabsTrigger value="ledger" disabled>Ledger</TabsTrigger>
            </TabsList>
            <TabsContent value="wos" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {jobs.length === 0 ? <EmptyState icon={FileText} title="No work orders assigned" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                      <th className="px-4 py-3 font-medium">WO</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Route</th><th className="px-4 py-3 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {jobs.map((w) => {
                        const c = customers.find((x) => x.id === w.customerId);
                        return (
                          <tr key={w.id} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-3"><Link to="/work-orders/$id" params={{ id: w.id }} className="text-primary hover:underline font-medium">{w.woNumber}</Link></td>
                            <td className="px-4 py-3">{c?.company ?? "—"}</td>
                            <td className="px-4 py-3 text-xs truncate max-w-[220px]">{w.pickup} → {w.delivery}</td>
                            <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>
            <TabsContent value="bills" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {bills.length === 0 ? <EmptyState icon={FileText} title="No bills yet" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                      <th className="px-4 py-3 font-medium">PO</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium text-right">Paid</th><th className="px-4 py-3 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {bills.map((p) => (
                        <tr key={p.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3 font-medium">{p.poNumber}</td>
                          <td className="px-4 py-3">{fmtDate(p.date)}</td>
                          <td className="px-4 py-3 text-right">{inr(p.amount)}</td>
                          <td className="px-4 py-3 text-right">{inr(p.paidAmount)}</td>
                          <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
