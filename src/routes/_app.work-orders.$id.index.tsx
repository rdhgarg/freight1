import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/stores/data";
import { aed, fmtDate, fmtDateTime } from "@/lib/format";
import { useCurrentUser } from "@/stores/auth";
import { FileX, Edit3, CheckCircle2, XCircle, RotateCcw, Send, ChevronRight, ClipboardCheck, FileText, Wallet, Receipt, Activity, Truck as TruckIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { WO_LIFECYCLE, EXPENSE_CATEGORIES } from "@/lib/types";
import type { WorkOrderStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/work-orders/$id/")({
  head: () => ({ meta: [{ title: "Work Order — HAMS" }] }),
  component: WODetail,
});

function WODetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const user = useCurrentUser();
  const {
    workOrders, customers, vendors, drivers, fleet,
    transitionWorkOrder, approveWorkOrder, rejectWorkOrder, sendBackWorkOrder,
    advanceWOStatus, assignDriverToWO, addWOExpense, addWOPayment, generateInvoiceForWO,
  } = useData();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) return <div className="card-elevated p-6"><EmptyState icon={FileX} title="Work order not found" action={<Button onClick={() => nav({ to: "/work-orders" })}>Back</Button>} /></div>;

  const customer = customers.find((c) => c.id === wo.customerId);
  const vendor = vendors.find((v) => v.id === wo.primaryVendorId);
  const assignedDriver = drivers.find((d) => d.id === wo.assignedDriverId);
  const assignedFleet = fleet.find((f) => f.id === wo.assignedFleetId);

  const subtotal = wo.containers * wo.rate;
  const vat = subtotal * (wo.taxPct ?? 0) / 100;
  const total = subtotal + vat;
  const paid = (wo.payments ?? []).reduce((s, p) => s + p.amount, 0);
  const balance = total - paid;
  const expensesTotal = (wo.woExpenses ?? []).reduce((s, e) => s + e.amount, 0);
  const margin = total - expensesTotal;

  const by = user?.name ?? "System";
  const canApprove = ["Submitted", "Under Review", "Pending Approval"].includes(wo.status);
  const canSubmit = wo.status === "Draft" || wo.status === "Sent Back";
  const lifecycleIdx = WO_LIFECYCLE.indexOf(wo.status);

  const nextStage = (): WorkOrderStatus | null => {
    if (lifecycleIdx < 0) return null;
    return WO_LIFECYCLE[lifecycleIdx + 1] ?? null;
  };

  return (
    <div>
      <PageHeader
        title={wo.woNumber}
        description={`${customer?.company ?? "—"} · ${wo.customerRef ?? ""}`}
        actions={
          <>
            <StatusBadge status={wo.status} />
            {canSubmit && <Button size="sm" variant="outline" onClick={() => { transitionWorkOrder(wo.id, "Submitted", by); toast.success("Submitted for approval"); }}><Send className="h-4 w-4 mr-1.5" /> Submit</Button>}
            {canApprove && <>
              <Button size="sm" variant="outline" onClick={() => { sendBackWorkOrder(wo.id, by); toast.message("Sent back"); }}><RotateCcw className="h-4 w-4 mr-1.5" /> Send Back</Button>
              <Button size="sm" variant="outline" onClick={() => { rejectWorkOrder(wo.id, by); toast.error("Rejected"); }}><XCircle className="h-4 w-4 mr-1.5" /> Reject</Button>
              <Button size="sm" onClick={() => { approveWorkOrder(wo.id, by); toast.success("Approved"); }}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve</Button>
            </>}
            <Button size="sm" variant="outline" onClick={() => nav({ to: "/work-orders/$id/edit", params: { id } })}><Edit3 className="h-4 w-4 mr-1.5" /> Edit</Button>
          </>
        }
      />

      {/* Lifecycle pipeline */}
      <div className="card-elevated p-4 mb-4 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {WO_LIFECYCLE.map((s, i) => {
            const done = lifecycleIdx >= 0 && i <= lifecycleIdx;
            const current = i === lifecycleIdx;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold border ${current ? "bg-primary text-primary-foreground border-primary" : done ? "bg-success/20 text-success border-success/40" : "bg-muted text-muted-foreground border-border"}`}>{i + 1}</div>
                <div className={`text-[11px] ${current ? "font-semibold" : done ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
                {i < WO_LIFECYCLE.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</div>
            <div className="mt-2 text-sm">
              <div className="font-medium">{customer?.company ?? "—"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{customer?.name} · {customer?.phone}</div>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">TRN: {customer?.gst}</div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commercial (AED)</div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row k="Rate" v={`${aed(wo.rate)} × ${wo.containers}`} />
              <Row k="Subtotal" v={aed(subtotal)} />
              <Row k={`VAT (${wo.taxPct ?? 0}%)`} v={aed(vat)} />
              <Row k="Total" v={<span className="font-bold text-primary">{aed(total)}</span>} />
              <Row k="Paid" v={aed(paid)} />
              <Row k="Balance" v={<span className={balance > 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>{aed(balance)}</span>} />
              <Row k="Expenses" v={aed(expensesTotal)} />
              <Row k="Margin" v={<span className={margin >= 0 ? "text-success" : "text-destructive"}>{aed(margin)}</span>} />
            </dl>
          </div>
          {vendor && (
            <div className="card-elevated p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Vendor</div>
              <div className="mt-2 text-sm">
                <div className="font-medium">{vendor.name}</div>
                <div className="text-xs text-muted-foreground">{vendor.category}</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="operations"><ClipboardCheck className="h-3.5 w-3.5 mr-1" />Operations</TabsTrigger>
              <TabsTrigger value="driver"><TruckIcon className="h-3.5 w-3.5 mr-1" />Driver</TabsTrigger>
              <TabsTrigger value="timeline"><MapPin className="h-3.5 w-3.5 mr-1" />Live Timeline</TabsTrigger>
              <TabsTrigger value="documents"><FileText className="h-3.5 w-3.5 mr-1" />Documents</TabsTrigger>
              <TabsTrigger value="expenses"><Wallet className="h-3.5 w-3.5 mr-1" />Expenses</TabsTrigger>
              <TabsTrigger value="invoice"><Receipt className="h-3.5 w-3.5 mr-1" />Invoice</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="h-3.5 w-3.5 mr-1" />Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="card-elevated p-4 grid gap-4 sm:grid-cols-2">
                <Info label="Cargo type" v={wo.cargoType ?? "—"} />
                <Info label="Commodity" v={wo.commodity ?? "—"} />
                <Info label="Container type" v={wo.containerType ?? "—"} />
                <Info label="Containers" v={String(wo.containers)} />
                <Info label="Shipping line" v={wo.shippingLine ?? "—"} />
                <Info label="Vessel / Voyage" v={`${wo.vessel ?? "—"} · ${wo.voyage ?? "—"}`} />
                <Info label="BL number" v={wo.blNumber ?? "—"} />
                <Info label="Port / Terminal" v={`${wo.port ?? "—"} · ${wo.terminal ?? "—"}`} />
                <Info label="Pickup" v={wo.pickup} />
                <Info label="Delivery" v={wo.delivery} />
                {wo.remarks && <Info label="Remarks" v={wo.remarks} full />}
              </div>
            </TabsContent>

            <TabsContent value="operations" className="mt-4">
              <div className="card-elevated p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold">Operations Checklist</div>
                    <div className="text-xs text-muted-foreground">Advance the WO through its operational lifecycle.</div>
                  </div>
                  {nextStage() && (
                    <Button size="sm" onClick={() => { advanceWOStatus(wo.id, nextStage()!, by); toast.success(`Advanced to ${nextStage()}`); }}>
                      Advance → {nextStage()}
                    </Button>
                  )}
                </div>
                <ul className="space-y-2">
                  {WO_LIFECYCLE.slice(1).map((stage) => {
                    const op = wo.ops?.find((o) => o.stage === stage);
                    const done = op?.completed || (lifecycleIdx >= 0 && WO_LIFECYCLE.indexOf(stage) <= lifecycleIdx);
                    return (
                      <li key={stage} className={`flex items-center gap-3 p-2.5 rounded-lg border ${done ? "bg-success/5 border-success/30" : "border-border"}`}>
                        <div className={`h-5 w-5 rounded-full grid place-items-center border-2 ${done ? "bg-success border-success" : "border-border"}`}>
                          {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 text-sm font-medium">{stage}</div>
                        {op?.completedAt && <div className="text-[11px] text-muted-foreground">{fmtDateTime(op.completedAt)} · {op.by}</div>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="driver" className="mt-4">
              <DriverAssignmentTab wo={wo} onAssign={(driverId, fleetId) => { assignDriverToWO(wo.id, driverId, fleetId, by); toast.success("Driver assigned"); }} drivers={drivers} fleet={fleet} assignedDriver={assignedDriver} assignedFleet={assignedFleet} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <div className="card-elevated p-4">
                {(wo.woTimeline ?? []).length === 0 ? <EmptyState icon={MapPin} title="No timeline events yet" /> : (
                  <ol className="space-y-3">
                    {(wo.woTimeline ?? []).slice().reverse().map((t) => (
                      <li key={t.id} className="flex gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{t.stage}</div>
                          <div className="text-[11px] text-muted-foreground">{fmtDateTime(t.at)} · {t.by ?? "—"} {t.note && `— ${t.note}`}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <div className="card-elevated p-6">
                <EmptyState icon={FileText} title="Documents" description="Upload BL, DO, invoice copies, and delivery proofs here. (Coming soon)" />
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <ExpensesTab wo={wo} onAdd={(e) => { addWOExpense(wo.id, { ...e, by }); toast.success("Expense added"); }} />
            </TabsContent>

            <TabsContent value="invoice" className="mt-4">
              <div className="card-elevated p-4">
                {wo.invoiceNo ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase">Invoice</div>
                        <div className="font-bold text-lg">{wo.invoiceNo}</div>
                        <div className="text-xs text-muted-foreground">Generated {wo.invoiceGeneratedAt ? fmtDate(wo.invoiceGeneratedAt) : "—"}</div>
                      </div>
                      <StatusBadge status={paid >= total ? "Paid" : paid > 0 ? "Partial" : "Sent"} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                      <div><div className="text-[11px] uppercase text-muted-foreground">Subtotal</div><div className="font-semibold">{aed(subtotal)}</div></div>
                      <div><div className="text-[11px] uppercase text-muted-foreground">VAT ({wo.taxPct ?? 0}%)</div><div className="font-semibold">{aed(vat)}</div></div>
                      <div><div className="text-[11px] uppercase text-muted-foreground">Total</div><div className="font-bold text-primary">{aed(total)}</div></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center py-6">
                    <div className="text-sm text-muted-foreground">No invoice generated yet.</div>
                    <Button size="sm" disabled={wo.status !== "Delivered" && lifecycleIdx < WO_LIFECYCLE.indexOf("Delivered")} onClick={() => { generateInvoiceForWO(wo.id, by); toast.success("Invoice generated"); }}>
                      Generate Invoice
                    </Button>
                    <div className="text-[11px] text-muted-foreground">Available after delivery is confirmed.</div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              <PaymentsTab wo={wo} balance={balance} onAdd={(p) => { addWOPayment(wo.id, { ...p, by }); toast.success("Payment recorded"); }} />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <div className="card-elevated p-4">
                <ol className="space-y-3">
                  {(wo.activityLog ?? []).slice().reverse().map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm"><span className="font-medium">{a.action}</span> {a.note && <span className="text-muted-foreground">— {a.note}</span>}</div>
                        <div className="text-[11px] text-muted-foreground">{fmtDateTime(a.at)} · {a.by}</div>
                      </div>
                    </li>
                  ))}
                  {(wo.activityLog ?? []).length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DriverAssignmentTab({ wo, drivers, fleet, assignedDriver, assignedFleet, onAssign }: {
  wo: { id: string };
  drivers: { id: string; name: string; status: string }[];
  fleet: { id: string; registration: string; status: string }[];
  assignedDriver?: { name: string; mobile: string; status: string };
  assignedFleet?: { registration: string; vehicleType: string };
  onAssign: (driverId: string, fleetId?: string) => void;
}) {
  const [driverId, setDriverId] = useState("");
  const [fleetId, setFleetId] = useState("");
  void wo;
  return (
    <div className="card-elevated p-4 space-y-4">
      {assignedDriver ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs uppercase text-muted-foreground">Currently Assigned</div>
          <div className="mt-1 text-sm font-medium">{assignedDriver.name} <span className="text-muted-foreground font-normal">· {assignedDriver.mobile}</span></div>
          {assignedFleet && <div className="text-xs text-muted-foreground mt-0.5">{assignedFleet.registration} · {assignedFleet.vehicleType}</div>}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No driver assigned yet.</div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block">Driver</Label>
          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
            <SelectContent>{drivers.filter((d) => d.status !== "Off Duty").map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · {d.status}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Fleet (optional)</Label>
          <Select value={fleetId} onValueChange={setFleetId}>
            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>{fleet.filter((f) => f.status !== "Retired").map((f) => <SelectItem key={f.id} value={f.id}>{f.registration} · {f.status}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" disabled={!driverId} onClick={() => onAssign(driverId, fleetId || undefined)}>Assign Driver</Button>
      </div>
    </div>
  );
}

function ExpensesTab({ wo, onAdd }: { wo: { woExpenses?: { id: string; date: string; category: string; amount: number; vendor?: string; notes?: string }[] }; onAdd: (e: { date: string; category: string; amount: number; vendor?: string; notes?: string }) => void }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const items = wo.woExpenses ?? [];
  const total = items.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="space-y-4">
      <div className="card-elevated p-4 grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <Label className="mb-1.5 block">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Amount (AED)</Label>
          <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <Label className="mb-1.5 block">Vendor</Label>
          <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <Label className="mb-1.5 block">Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <Button size="sm" disabled={amount <= 0} onClick={() => { onAdd({ date: new Date().toISOString(), category, amount, vendor: vendor || undefined, notes: notes || undefined }); setAmount(0); setVendor(""); setNotes(""); }}>Add Expense</Button>
        </div>
      </div>
      <div className="card-elevated overflow-hidden">
        {items.length === 0 ? <EmptyState icon={Wallet} title="No expenses yet" /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
              <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Vendor</th><th className="px-4 py-3 font-medium">Notes</th><th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr></thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(e.date)}</td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3">{e.vendor ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.notes ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{aed(e.amount)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-right">Total</td>
                <td className="px-4 py-3 text-right text-primary">{aed(total)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PaymentsTab({ wo, balance, onAdd }: { wo: { payments?: { id: string; date: string; amount: number; mode: string; reference?: string }[] }; balance: number; onAdd: (p: { date: string; amount: number; mode: "Cash" | "Bank Transfer" | "Cheque" | "Card" | "UPI"; reference?: string }) => void }) {
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<"Cash" | "Bank Transfer" | "Cheque" | "Card" | "UPI">("Bank Transfer");
  const [reference, setReference] = useState("");
  const items = wo.payments ?? [];
  const total = items.reduce((s, p) => s + p.amount, 0);
  return (
    <div className="space-y-4">
      <div className="card-elevated p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label className="mb-1.5 block">Amount (AED)</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 block">Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Cash", "Bank Transfer", "Cheque", "Card", "UPI"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">Reference</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Txn ID / cheque #" />
          </div>
          <div className="sm:col-span-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Outstanding balance: <span className="font-semibold text-foreground">{aed(balance)}</span></div>
            <Button size="sm" disabled={amount <= 0} onClick={() => { onAdd({ date: new Date().toISOString(), amount, mode, reference: reference || undefined }); setAmount(0); setReference(""); }}>Record Payment</Button>
          </div>
        </div>
      </div>
      <div className="card-elevated overflow-hidden">
        {items.length === 0 ? <EmptyState icon={Receipt} title="No payments received" /> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase text-muted-foreground border-b border-border">
              <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Mode</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(p.date)}</td>
                  <td className="px-4 py-3">{p.mode}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.reference ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{aed(p.amount)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-right">Total received</td>
                <td className="px-4 py-3 text-right text-primary">{aed(total)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Unused placeholder to keep Textarea import valid for future notes fields.
export const _Textarea = Textarea;

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>;
}
function Info({ label, v, full }: { label: string; v: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="mt-0.5 text-sm break-words">{v}</div>
    </div>
  );
}
