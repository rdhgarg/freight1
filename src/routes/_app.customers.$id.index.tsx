import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { useData } from "@/stores/data";
import { aed, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Mail, Phone, MapPin, FileText, UserX, Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/customers/$id/")({
  head: () => ({ meta: [{ title: "Customer — HAMS" }] }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { customers, workOrders, invoices, receipts } = useData();
  const c = customers.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="card-elevated p-6">
        <EmptyState icon={UserX} title="Customer not found" action={<Button onClick={() => navigate({ to: "/customers" })}>Back</Button>} />
      </div>
    );
  }

  const custWOs = workOrders.filter((w) => w.customerId === id);
  const custInvoices = invoices.filter((i) => i.customerId === id);
  const custReceipts = receipts.filter((r) => r.customerId === id);
  const outstanding = custInvoices.reduce((sum, i) => sum + (i.total - i.paid), 0);
  const totalBilled = custInvoices.reduce((sum, i) => sum + i.total, 0);

  // Build ledger (chronological)
  const ledger = [
    ...custInvoices.map((i) => ({ date: i.date, kind: "Invoice", ref: i.invoiceNo, debit: i.total, credit: 0 })),
    ...custReceipts.map((r) => ({ date: r.date, kind: "Receipt", ref: r.receiptNo, debit: 0, credit: r.amount })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  let bal = 0;

  return (
    <div>
      <PageHeader
        title={c.company}
        description={`${c.name} · TRN ${c.gst}`}
        actions={
          <>
            <StatusBadge status={c.status} />
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/customers/$id/edit", params: { id } })}>
              <Edit3 className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2"><Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span className="min-w-0 break-words">{c.company}</span></div>
              <div className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span className="min-w-0 break-all">{c.email}</span></div>
              <div className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />{c.phone}</div>
              <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><span className="min-w-0">{c.address}</span></div>
            </div>
          </div>

          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terms</div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Payment Terms</dt><dd>{c.paymentTerms}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Credit Limit</dt><dd className="font-medium">{aed(c.creditLimit)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Outstanding</dt><dd className={outstanding > 0 ? "text-destructive font-medium" : ""}>{aed(outstanding)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total Billed</dt><dd className="font-medium">{aed(totalBilled)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="workOrders">
            <TabsList>
              <TabsTrigger value="workOrders">Work Orders ({custWOs.length})</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="invoices">Invoices ({custInvoices.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="workOrders" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {custWOs.length === 0 ? (
                  <EmptyState icon={FileText} title="No work orders yet" />
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                        <th className="px-4 py-3 font-medium">Work Order</th>
                        <th className="px-4 py-3 font-medium">Route</th>
                        <th className="px-4 py-3 font-medium">Value</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {custWOs.map((w) => (
                        <tr key={w.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3">
                            <Link to="/work-orders/$id" params={{ id: w.id }} className="text-primary hover:underline font-medium">{w.woNumber}</Link>
                            <div className="text-[11px] text-muted-foreground">{fmtDate(w.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="truncate max-w-[200px]">{w.pickup}</div>
                            <div className="truncate max-w-[200px] text-muted-foreground">→ {w.delivery}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">{aed(w.containers * w.rate)}</td>
                          <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>


            <TabsContent value="ledger" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {ledger.length === 0 ? <EmptyState icon={FileText} title="No transactions yet" /> : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Reference</th>
                        <th className="px-4 py-3 font-medium text-right">Debit</th>
                        <th className="px-4 py-3 font-medium text-right">Credit</th>
                        <th className="px-4 py-3 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map((row, i) => {
                        bal += row.debit - row.credit;
                        return (
                          <tr key={i} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-3 whitespace-nowrap">{fmtDate(row.date)}</td>
                            <td className="px-4 py-3">{row.kind} · <span className="font-medium">{row.ref}</span></td>
                            <td className="px-4 py-3 text-right">{row.debit ? aed(row.debit) : "—"}</td>
                            <td className="px-4 py-3 text-right">{row.credit ? aed(row.credit) : "—"}</td>
                            <td className="px-4 py-3 text-right font-medium">{aed(bal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <div className="card-elevated overflow-hidden">
                {custInvoices.length === 0 ? <EmptyState icon={FileText} title="No invoices yet" /> : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
                        <th className="px-4 py-3 font-medium">Invoice</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Due</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                        <th className="px-4 py-3 font-medium text-right">Paid</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {custInvoices.map((i) => (
                        <tr key={i.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3 font-medium">{i.invoiceNo}</td>
                          <td className="px-4 py-3">{fmtDate(i.date)}</td>
                          <td className="px-4 py-3">{fmtDate(i.dueDate)}</td>
                          <td className="px-4 py-3 text-right">{aed(i.total)}</td>
                          <td className="px-4 py-3 text-right">{aed(i.paid)}</td>
                          <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
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
