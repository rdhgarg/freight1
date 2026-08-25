import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Receipt, Trash2, Wallet, FileText, CheckCircle2, XCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, StatusBadge } from "@/components/page-header";
import { useData } from "@/stores/data";
import { useActor } from "@/components/wo/use-actor";
import { aed, fmtDate, fmtDateTime } from "@/lib/format";
import { fileToDataUrl, woMoney } from "@/lib/wo";
import { invoiceDisplayStatus } from "@/lib/invoice";
import { WO_EXPENSE_CATEGORIES, PAYMENT_MODES } from "@/lib/types";
import type { PaymentMode, WorkOrder } from "@/lib/types";

/* -------------------------------- Expenses -------------------------------- */

export function ExpensesTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { vendors, addWOExpense, updateWOExpenseStatus, deleteWOExpense } = useData();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: WO_EXPENSE_CATEGORIES[0] as string,
    vendorId: "",
    amount: 0,
    vatPct: 5,
    notes: "",
    receiptUrl: "" as string | undefined,
    receiptName: "" as string | undefined,
  });
  const items = wo.woExpenses ?? [];
  const m = woMoney(wo);

  const submit = () => {
    if (form.amount <= 0) return;
    const vendor = vendors.find((v) => v.id === form.vendorId);
    addWOExpense(
      wo.id,
      {
        date: new Date(form.date).toISOString(),
        category: form.category,
        amount: form.amount,
        vatPct: form.vatPct,
        vendorId: form.vendorId || undefined,
        vendor: vendor?.name,
        notes: form.notes || undefined,
        receiptUrl: form.receiptUrl,
        receiptName: form.receiptName,
        by: actor.by,
        status: "Pending",
      },
      actor,
    );
    toast.success("Expense added");
    setOpen(false);
    setForm({ ...form, amount: 0, notes: "", receiptUrl: undefined, receiptName: undefined, vendorId: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Total expenses" value={aed(m.expenses)} />
        <Summary label="Total VAT" value={aed(m.expensesVat)} />
        <Summary label="Grand total" value={aed(m.expensesGrand)} strong />
      </div>

      <div className="card-elevated p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Operational expenses</div>
          <div className="text-xs text-muted-foreground">{items.length} entries recorded against this work order</div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Expense date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WO_EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Vendor</Label>
                <Select value={form.vendorId} onValueChange={(v) => setForm({ ...form, vendorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Amount (AED)</Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="mb-1.5 block">VAT %</Label>
                <Input type="number" min={0} max={100} value={form.vatPct} onChange={(e) => setForm({ ...form, vatPct: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="mb-1.5 block">VAT amount</Label>
                <Input readOnly value={aed((form.amount * form.vatPct) / 100)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Receipt</Label>
                <Input
                  ref={fileRef}
                  type="file"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = f.size > 2 * 1024 * 1024 ? undefined : await fileToDataUrl(f);
                    setForm((s) => ({ ...s, receiptUrl: url, receiptName: f.name }));
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Remarks</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={form.amount <= 0} onClick={submit}>Add expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-elevated overflow-hidden">
        {items.length === 0 ? (
          <EmptyState icon={Wallet} title="No expenses yet" description="Record fuel, parking, port charges, toll and labour costs here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">VAT</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const vat = (e.amount * (e.vatPct ?? 0)) / 100;
                  return (
                    <tr key={e.id} className="border-b border-border/60 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3">{fmtDate(e.date)}</td>
                      <td className="px-4 py-3">{e.category}</td>
                      <td className="px-4 py-3">{e.vendor ?? "—"}</td>
                      <td className="px-4 py-3 text-right">{aed(e.amount)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{aed(vat)}</td>
                      <td className="px-4 py-3 text-right font-medium">{aed(e.amount + vat)}</td>
                      <td className="px-4 py-3">
                        {e.receiptUrl ? <a className="text-primary hover:underline" href={e.receiptUrl} target="_blank" rel="noreferrer">View</a> : (e.receiptName ?? "—")}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={e.status ?? "Pending"} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => { updateWOExpenseStatus(wo.id, e.id, "Approved", actor); toast.success("Expense approved"); }}><CheckCircle2 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { updateWOExpenseStatus(wo.id, e.id, "Rejected", actor); toast.message("Expense rejected"); }}><XCircle className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => { deleteWOExpense(wo.id, e.id, actor); toast.message("Expense deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/40 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-right">Totals</td>
                  <td className="px-4 py-3 text-right">{aed(m.expenses)}</td>
                  <td className="px-4 py-3 text-right">{aed(m.expensesVat)}</td>
                  <td className="px-4 py-3 text-right text-primary">{aed(m.expensesGrand)}</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Invoice -------------------------------- */

export function InvoiceTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { generateWOInvoice, issueWOInvoice, customers } = useData();
  const [vatPct, setVatPct] = useState(wo.taxPct ?? 5);
  const [dueDays, setDueDays] = useState(30);
  const m = woMoney(wo);
  const customer = customers.find((c) => c.id === wo.customerId);
  const inv = wo.invoice;

  const print = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w || !inv) return;
    w.document.write(`<html><head><title>${inv.invoiceNo}</title><style>body{font-family:system-ui;padding:32px;color:#111}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}h1{margin:0}</style></head><body>
      <h1>TAX INVOICE</h1><p>${inv.invoiceNo} · ${fmtDate(inv.date)}</p>
      <p><strong>Bill to:</strong> ${customer?.company ?? "—"}<br/>TRN: ${customer?.gst ?? "—"}</p>
      <p><strong>Work order:</strong> ${wo.woNumber} · ${wo.pickup} → ${wo.delivery}</p>
      <table><tr><th>Description</th><th>Qty</th><th>Rate (AED)</th><th>Amount (AED)</th></tr>
      <tr><td>${wo.commodity ?? "Freight services"} — ${wo.containerType ?? ""}</td><td>${wo.containers}</td><td>${wo.rate}</td><td>${inv.subtotal}</td></tr>
      <tr><td colspan="3">VAT (${inv.vatPct}%)</td><td>${inv.vatAmount}</td></tr>
      <tr><td colspan="3"><strong>Grand total</strong></td><td><strong>${inv.total}</strong></td></tr></table>
      <p>Due: ${fmtDate(inv.dueDate)} · Status: ${inv.status}</p></body></html>`);
    w.document.close();
    w.print();
  };

  if (!inv) {
    const subtotal = wo.containers * wo.rate;
    const vat = (subtotal * vatPct) / 100;
    return (
      <div className="card-elevated p-4 space-y-4">
        <div>
          <div className="text-sm font-semibold">Generate invoice</div>
          <div className="text-xs text-muted-foreground">Pulls quantity, rate and route straight from this work order.</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 block">VAT %</Label>
            <Input type="number" min={0} max={100} value={vatPct} onChange={(e) => setVatPct(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 block">Payment terms (days)</Label>
            <Input type="number" min={0} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 block">Bill to</Label>
            <Input readOnly value={customer?.company ?? "—"} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <Row k={`Subtotal (${wo.containers} × ${aed(wo.rate)})`} v={aed(subtotal)} />
          <Row k={`VAT (${vatPct}%)`} v={aed(vat)} />
          <Row k="Grand total" v={<span className="font-bold text-primary">{aed(subtotal + vat)}</span>} />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { generateWOInvoice(wo.id, { vatPct, dueDays }, actor); toast.success("Invoice draft created — review and issue it from the invoice workspace"); }}>
            <FileText className="h-4 w-4 mr-1.5" /> Create draft invoice
          </Button>
        </div>
      </div>
    );
  }

  const displayStatus = invoiceDisplayStatus(inv, m.paid);

  return (
    <div className="card-elevated p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Tax invoice</div>
          <div className="text-lg font-bold">{inv.invoiceNo}</div>
          <div className="text-xs text-muted-foreground">
            {inv.status === "Draft"
              ? `Draft · Created ${fmtDate(inv.date)} · By ${inv.generatedBy ?? "—"}`
              : `Issued ${fmtDate(inv.issuedAt ?? inv.date)} · Due ${fmtDate(inv.dueDate)} · By ${inv.issuedBy ?? inv.generatedBy ?? "—"}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={displayStatus} />
          {inv.status === "Draft" && (
            <Button
              size="sm"
              onClick={() => {
                const err = issueWOInvoice(wo.id, actor);
                if (err) toast.error(err);
                else toast.success(`${inv.invoiceNo} issued`);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Issue invoice
            </Button>
          )}
          <Link to="/invoices/$id" params={{ id: wo.id }}>
            <Button size="sm" variant="outline"><FileText className="h-4 w-4 mr-1.5" /> {inv.status === "Draft" ? "Edit draft" : "Open invoice"}</Button>
          </Link>
          <Button size="sm" variant="outline" onClick={print}><Printer className="h-4 w-4 mr-1.5" /> Print</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border p-3 text-sm">
        <Row k="Bill to" v={`${customer?.company ?? "—"} · TRN ${customer?.gst ?? "—"}`} />
        <Row k="Work order" v={`${wo.woNumber} · ${wo.pickup} → ${wo.delivery}`} />
        <Row k="Subtotal (AED)" v={aed(inv.subtotal)} />
        <Row k={`VAT (${inv.vatPct}%)`} v={aed(inv.vatAmount)} />
        <Row k="Grand total (AED)" v={<span className="font-bold text-primary">{aed(inv.total)}</span>} />
        {inv.status !== "Draft" && inv.status !== "Cancelled" && (
          <>
            <Row k="Received" v={aed(m.paid)} />
            <Row k="Outstanding" v={<span className={m.balance > 0 ? "font-semibold text-destructive" : "font-semibold text-success"}>{aed(m.balance)}</span>} />
          </>
        )}
        {inv.status === "Cancelled" && <Row k="Cancelled" v={`${fmtDateTime(inv.cancelledAt ?? "")} · By ${inv.cancelledBy ?? "—"}`} />}
      </div>
    </div>
  );
}

/* -------------------------------- Payments -------------------------------- */

export function PaymentsTab({ wo }: { wo: WorkOrder }) {
  const actor = useActor();
  const { addWOPayment, deleteWOPayment } = useData();
  const m = woMoney(wo);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), mode: "Bank Transfer" as PaymentMode, reference: "", amount: 0 });
  const items = (wo.payments ?? []).slice().reverse();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Invoice total" value={aed(m.total)} />
        <Summary label="Received" value={aed(m.paid)} />
        <Summary label="Outstanding" value={aed(m.balance)} strong />
      </div>

      <div className="card-elevated p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Payment history</div>
          <div className="text-xs text-muted-foreground">Outstanding updates automatically with every receipt.</div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" disabled={!wo.invoice}><Plus className="h-4 w-4 mr-1.5" /> Add payment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Payment date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Payment mode</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v as PaymentMode })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_MODES.map((mo) => <SelectItem key={mo} value={mo}>{mo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Reference number</Label>
                <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Txn / cheque no." />
              </div>
              <div>
                <Label className="mb-1.5 block">Amount (AED)</Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2 text-xs text-muted-foreground">Balance after this payment: <strong>{aed(Math.max(0, m.balance - form.amount))}</strong></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                disabled={form.amount <= 0}
                onClick={() => {
                  addWOPayment(wo.id, { date: new Date(form.date).toISOString(), amount: form.amount, mode: form.mode, reference: form.reference || undefined, by: actor.by }, actor);
                  toast.success("Payment recorded");
                  setOpen(false);
                  setForm({ ...form, amount: 0, reference: "" });
                }}
              >
                Record payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-elevated overflow-hidden">
        {items.length === 0 ? (
          <EmptyState icon={Receipt} title="No payments received" description={wo.invoice ? "Record the first receipt against this invoice." : "Generate the invoice first."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Recorded by</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3">{fmtDateTime(p.date)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.receiptNo ?? "—"}</td>
                    <td className="px-4 py-3">{p.mode}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.reference ?? "—"}</td>
                    <td className="px-4 py-3">{p.by ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{aed(p.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => { deleteWOPayment(wo.id, p.id, actor); toast.message("Payment removed"); }}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40 font-semibold">
                  <td colSpan={5} className="px-4 py-3 text-right">Total received</td>
                  <td className="px-4 py-3 text-right text-primary">{aed(m.paid)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Outstanding ------------------------------- */

export function OutstandingTab({ wo }: { wo: WorkOrder }) {
  const m = woMoney(wo);
  const inv = wo.invoice;
  const overdueDays = inv ? Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000) : 0;
  const bucket = !inv || m.balance === 0 ? "Settled" : overdueDays <= 0 ? "Current" : overdueDays <= 30 ? "1–30 days" : overdueDays <= 60 ? "31–60 days" : "60+ days";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Invoiced" value={aed(m.total)} />
        <Summary label="Received" value={aed(m.paid)} />
        <Summary label="Outstanding" value={aed(m.balance)} strong />
      </div>
      <div className="card-elevated p-4 text-sm">
        <Row k="Invoice" v={inv?.invoiceNo ?? "Not generated"} />
        <Row k="Invoice status" v={inv ? <StatusBadge status={inv.status} /> : "—"} />
        <Row k="Due date" v={inv ? fmtDate(inv.dueDate) : "—"} />
        <Row k="Ageing bucket" v={<StatusBadge status={bucket} />} />
        <Row k="Days overdue" v={inv && overdueDays > 0 && m.balance > 0 ? `${overdueDays} days` : "—"} />
        <Row k="Operational cost" v={aed(m.expensesGrand)} />
        <Row k="Net margin" v={<span className={m.margin >= 0 ? "font-semibold text-success" : "font-semibold text-destructive"}>{aed(m.margin)}</span>} />
      </div>
    </div>
  );
}

/* --------------------------------- shared --------------------------------- */

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="card-elevated p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-bold ${strong ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
