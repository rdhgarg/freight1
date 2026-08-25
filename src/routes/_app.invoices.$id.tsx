import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft, Ban, CheckCircle2, Copy, FileText, Pencil, Plus, Printer, Trash2, Wallet,
} from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/stores/data";
import { useActor } from "@/components/wo/use-actor";
import { aed, fmtDate, fmtDateTime, uid } from "@/lib/format";
import { woMoney } from "@/lib/wo";
import { invoiceDisplayStatus, lineTotal, lineTaxable, lineVat } from "@/lib/invoice";
import { PAYMENT_MODES } from "@/lib/types";
import type { InvoiceLineItem, PaymentMode } from "@/lib/types";

const COMPANY = {
  name: "HAMS Logistics LLC",
  trn: "100234567890003",
  address: "JAFZA South, P.O. Box 118822, Dubai, UAE",
  phone: "+971 4 000 0000",
  email: "accounts@hamslogistics.ae",
};

export const Route = createFileRoute("/_app/invoices/$id")({
  head: () => ({
    meta: [
      { title: "Invoice — HAMS" },
      { name: "description", content: "UAE tax invoice workspace — issue, print, record payments." },
      { property: "og:title", content: "Invoice — HAMS" },
      { property: "og:description", content: "UAE tax invoice workspace." },
    ],
  }),
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const actor = useActor();
  const {
    workOrders, customers, generateWOInvoice, issueWOInvoice, updateWOInvoice,
    cancelWOInvoice, deleteWOInvoice, duplicateWOInvoice, addWOPayment,
  } = useData();
  const wo = workOrders.find((w) => w.id === id);
  const customer = wo ? customers.find((c) => c.id === wo.customerId) : undefined;
  const inv = wo?.invoice;
  const m = wo ? woMoney(wo) : undefined;
  const display = inv && m ? invoiceDisplayStatus(inv, m.paid) : undefined;

  const [editing, setEditing] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pay, setPay] = useState({ date: new Date().toISOString().slice(0, 10), mode: "Bank Transfer" as PaymentMode, reference: "", amount: 0 });

  if (!wo) {
    return <div className="card-elevated p-6"><EmptyState icon={FileText} title="Invoice not found" action={<Button onClick={() => nav({ to: "/invoices" })}>Back to invoices</Button>} /></div>;
  }

  if (!inv || !m || !display) {
    return (
      <div className="card-elevated p-6">
        <EmptyState
          icon={FileText}
          title={`No invoice for ${wo.woNumber} yet`}
          description="Create a draft from the work order's rates, edit line items, then issue it."
          action={
            <Button
              onClick={() => {
                generateWOInvoice(wo.id, { vatPct: wo.taxPct ?? 5, dueDays: 30 }, actor);
                toast.success("Invoice draft created");
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create draft invoice
            </Button>
          }
        />
      </div>
    );
  }

  const isDraft = inv.status === "Draft";
  const isCancelled = inv.status === "Cancelled";
  const lines = inv.lines ?? [
    { id: "il_0", description: `${wo.commodity ?? "Freight services"} — ${wo.containerType ?? ""}`, qty: wo.containers || 1, unit: "Container", rate: wo.rate, discount: 0, vatPct: inv.vatPct },
  ];

  const print = () => {
    const w = window.open("", "_blank", "width=840,height=1000");
    if (!w) return;
    const rows = lines
      .map(
        (l, i) =>
          `<tr><td>${i + 1}</td><td>${l.description}</td><td style="text-align:right">${l.qty}</td><td>${l.unit}</td><td style="text-align:right">${l.rate.toFixed(2)}</td><td style="text-align:right">${(l.discount || 0).toFixed(2)}</td><td style="text-align:right">${l.vatPct}%</td><td style="text-align:right">${lineTotal(l).toFixed(2)}</td></tr>`,
      )
      .join("");
    w.document.write(`<html><head><title>${inv.invoiceNo}</title><style>
      body{font-family:system-ui;padding:36px;color:#111;max-width:800px;margin:auto}
      table{width:100%;border-collapse:collapse;margin-top:14px;font-size:13px}
      td,th{border-bottom:1px solid #ddd;padding:7px;text-align:left}
      .head{display:flex;justify-content:space-between;align-items:flex-start}
      .tot{margin-left:auto;width:280px}
      .tot div{display:flex;justify-content:space-between;padding:3px 0}
      .grand{font-weight:700;border-top:2px solid #111;margin-top:6px;padding-top:6px}
      h1{margin:0;font-size:22px}.muted{color:#555;font-size:12px}
    </style></head><body>
      <div class="head"><div><h1>${COMPANY.name}</h1><div class="muted">${COMPANY.address}<br/>TRN: ${COMPANY.trn} · ${COMPANY.phone} · ${COMPANY.email}</div></div>
      <div style="text-align:right"><h2 style="margin:0">TAX INVOICE</h2><div class="muted">${inv.invoiceNo}${isDraft ? " · DRAFT" : ""}${isCancelled ? " · CANCELLED" : ""}</div></div></div>
      <hr/>
      <p><strong>Bill to:</strong> ${customer?.company ?? "—"}<br/><span class="muted">TRN: ${customer?.gst ?? "—"} · ${customer?.address ?? ""}</span></p>
      <p class="muted">Work order: ${wo.woNumber} · ${wo.pickup} → ${wo.delivery}${wo.blNumber ? ` · B/L ${wo.blNumber}` : ""}</p>
      <p class="muted">Invoice date: ${fmtDate(inv.date)} · Due date: ${fmtDate(inv.dueDate)}</p>
      <table><thead><tr><th>#</th><th>Description</th><th style="text-align:right">Qty</th><th>Unit</th><th style="text-align:right">Rate</th><th style="text-align:right">Disc.</th><th style="text-align:right">VAT</th><th style="text-align:right">Amount (AED)</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="tot">
        <div><span>Subtotal</span><span>${inv.subtotal.toFixed(2)}</span></div>
        <div><span>VAT</span><span>${inv.vatAmount.toFixed(2)}</span></div>
        <div class="grand"><span>Grand total (AED)</span><span>${inv.total.toFixed(2)}</span></div>
        <div><span>Received</span><span>${m.paid.toFixed(2)}</span></div>
        <div><span>Balance due</span><span>${m.balance.toFixed(2)}</span></div>
      </div>
      ${inv.notes ? `<p class="muted">Notes: ${inv.notes}</p>` : ""}
      <p class="muted" style="margin-top:28px">This is a computer-generated tax invoice. Company TRN: ${COMPANY.trn}.</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const financeActivity = (wo.activityLog ?? [])
    .filter((a) => /invoice|payment|outstanding|financial/i.test(a.action))
    .slice()
    .reverse();

  return (
    <div>
      <PageHeader
        title={inv.invoiceNo}
        description={`${wo.woNumber} · ${customer?.company ?? "—"}`}
        actions={
          <>
            <StatusBadge status={display} />
            <Link to="/invoices"><Button size="sm" variant="outline"><ArrowLeft className="h-4 w-4 mr-1.5" /> All invoices</Button></Link>
            {isDraft && (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1.5" /> Edit draft</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const err = issueWOInvoice(wo.id, actor);
                    if (err) toast.error(err);
                    else toast.success(`${inv.invoiceNo} issued — work order moved to Invoice Generated`);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Issue invoice
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    if (!window.confirm(`Delete draft ${inv.invoiceNo}? This cannot be undone.`)) return;
                    deleteWOInvoice(wo.id, actor);
                    toast.message("Draft deleted");
                    nav({ to: "/invoices" });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {!isDraft && !isCancelled && (
              <>
                <Dialog open={payOpen} onOpenChange={setPayOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={m.balance <= 0}><Wallet className="h-4 w-4 mr-1.5" /> Record payment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Record payment — {inv.invoiceNo}</DialogTitle></DialogHeader>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 block">Payment date</Label>
                        <Input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} />
                      </div>
                      <div>
                        <Label className="mb-1.5 block">Mode</Label>
                        <Select value={pay.mode} onValueChange={(v) => setPay({ ...pay, mode: v as PaymentMode })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{PAYMENT_MODES.map((mo) => <SelectItem key={mo} value={mo}>{mo}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-1.5 block">Reference</Label>
                        <Input value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} placeholder="Txn / cheque no." />
                      </div>
                      <div>
                        <Label className="mb-1.5 block">Amount (AED)</Label>
                        <Input type="number" min={0} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} />
                      </div>
                      <div className="sm:col-span-2 text-xs text-muted-foreground">
                        Balance after this payment: <strong>{aed(Math.max(0, m.balance - pay.amount))}</strong>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
                      <Button
                        disabled={pay.amount <= 0}
                        onClick={() => {
                          addWOPayment(wo.id, { date: new Date(pay.date).toISOString(), amount: pay.amount, mode: pay.mode, reference: pay.reference || undefined, by: actor.by }, actor);
                          toast.success("Payment recorded");
                          setPayOpen(false);
                          setPay({ ...pay, amount: 0, reference: "" });
                        }}
                      >
                        Save payment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    if (!window.confirm(`Cancel ${inv.invoiceNo}? The ledger records a reversal adjustment.`)) return;
                    cancelWOInvoice(wo.id, actor);
                    toast.message("Invoice cancelled");
                  }}
                >
                  <Ban className="h-4 w-4 mr-1.5" /> Cancel
                </Button>
              </>
            )}
            {isCancelled && (
              <Button
                size="sm"
                onClick={() => {
                  duplicateWOInvoice(wo.id, actor);
                  toast.success("New draft created from cancelled invoice");
                }}
              >
                <Copy className="h-4 w-4 mr-1.5" /> Duplicate as draft
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={print}><Printer className="h-4 w-4 mr-1.5" /> Print / PDF</Button>
          </>
        }
      />

      {editing && isDraft ? (
        <DraftEditor
          key={inv.invoiceNo}
          lines={lines}
          date={inv.date}
          dueDate={inv.dueDate}
          notes={inv.notes ?? ""}
          onCancel={() => setEditing(false)}
          onSave={(patch) => {
            updateWOInvoice(wo.id, patch, actor);
            setEditing(false);
            toast.success("Draft updated");
          }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* ---------- tax invoice preview ---------- */}
          <div className="lg:col-span-2 card-elevated p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold">{COMPANY.name}</div>
                <div className="text-xs text-muted-foreground">{COMPANY.address}</div>
                <div className="text-xs text-muted-foreground">TRN: {COMPANY.trn} · {COMPANY.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold tracking-wide">TAX INVOICE</div>
                <div className="text-sm font-mono">{inv.invoiceNo}</div>
                <div className="text-xs text-muted-foreground">
                  {isDraft ? "DRAFT — not yet issued" : isCancelled ? "CANCELLED" : `Issued ${fmtDate(inv.issuedAt ?? inv.date)}`}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Bill to</div>
                <div className="mt-1 font-semibold">{customer?.company ?? "—"}</div>
                <div className="text-xs text-muted-foreground">TRN: {customer?.gst ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{customer?.address ?? ""}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Details</div>
                <div className="mt-1 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Invoice date</span><span>{fmtDate(inv.date)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Due date</span><span>{fmtDate(inv.dueDate)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Work order</span><Link to="/work-orders/$id" params={{ id: wo.id }} className="text-primary hover:underline">{wo.woNumber}</Link></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="text-right">{wo.pickup} → {wo.delivery}</span></div>
                  {wo.blNumber && <div className="flex justify-between"><span className="text-muted-foreground">B/L</span><span>{wo.blNumber}</span></div>}
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium">Description</th>
                    <th className="px-3 py-2.5 font-medium text-right">Qty</th>
                    <th className="px-3 py-2.5 font-medium">Unit</th>
                    <th className="px-3 py-2.5 font-medium text-right">Rate</th>
                    <th className="px-3 py-2.5 font-medium text-right">Discount</th>
                    <th className="px-3 py-2.5 font-medium text-right">VAT</th>
                    <th className="px-3 py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-2.5">{l.description}</td>
                      <td className="px-3 py-2.5 text-right">{l.qty}</td>
                      <td className="px-3 py-2.5">{l.unit}</td>
                      <td className="px-3 py-2.5 text-right">{aed(l.rate)}</td>
                      <td className="px-3 py-2.5 text-right">{l.discount ? aed(l.discount) : "—"}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">{l.vatPct}% · {aed(lineVat(l))}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{aed(lineTotal(l))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{aed(inv.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>{aed(inv.vatAmount)}</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold"><span>Grand total</span><span className="text-primary">{aed(inv.total)}</span></div>
              {!isDraft && !isCancelled && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Received</span><span className="text-success">{aed(m.paid)}</span></div>
                  <div className="flex justify-between font-semibold"><span>Balance due</span><span className={m.balance > 0 ? "text-destructive" : "text-success"}>{aed(m.balance)}</span></div>
                </>
              )}
            </div>
            {inv.notes && <div className="mt-3 text-xs text-muted-foreground">Notes: {inv.notes}</div>}
          </div>

          {/* ---------- side: payments + activity ---------- */}
          <div className="space-y-4">
            <div className="card-elevated p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payments</div>
              {(wo.payments ?? []).length === 0 ? (
                <div className="mt-2 text-xs text-muted-foreground">No payments recorded yet.</div>
              ) : (
                <div className="mt-2 space-y-2">
                  {(wo.payments ?? []).slice().reverse().map((p) => (
                    <div key={p.id} className="rounded-lg border border-border p-2.5 text-xs">
                      <div className="flex justify-between font-semibold"><span>{p.receiptNo ?? "—"}</span><span>{aed(p.amount)}</span></div>
                      <div className="mt-0.5 text-muted-foreground">{fmtDate(p.date)} · {p.mode}{p.reference ? ` · ${p.reference}` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-elevated p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financial activity</div>
              {financeActivity.length === 0 ? (
                <div className="mt-2 text-xs text-muted-foreground">No financial activity yet.</div>
              ) : (
                <div className="mt-2 space-y-2">
                  {financeActivity.slice(0, 8).map((a) => (
                    <div key={a.id} className="border-l-2 border-primary/40 pl-2.5 text-xs">
                      <div className="font-medium">{a.action}</div>
                      <div className="text-muted-foreground">{a.note ?? ""}</div>
                      <div className="text-muted-foreground">{fmtDateTime(a.at)} · {a.by}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ draft editor ------------------------------ */

function DraftEditor({
  lines: initial, date, dueDate, notes, onCancel, onSave,
}: {
  lines: InvoiceLineItem[];
  date: string;
  dueDate: string;
  notes: string;
  onCancel: () => void;
  onSave: (patch: { date: string; dueDate: string; notes: string; lines: InvoiceLineItem[] }) => void;
}) {
  const [lines, setLines] = useState<InvoiceLineItem[]>(initial.map((l) => ({ ...l })));
  const [d, setD] = useState(date.slice(0, 10));
  const [due, setDue] = useState(dueDate.slice(0, 10));
  const [n, setN] = useState(notes);

  const setLine = (i: number, patch: Partial<InvoiceLineItem>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const totals = useMemo(
    () => ({
      subtotal: lines.reduce((s, l) => s + lineTaxable(l), 0),
      vat: lines.reduce((s, l) => s + lineVat(l), 0),
      total: lines.reduce((s, l) => s + lineTotal(l), 0),
    }),
    [lines],
  );

  return (
    <div className="card-elevated p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Edit draft invoice</div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setLines((ls) => [...ls, { id: uid("il_"), description: "", qty: 1, unit: "Job", rate: 0, discount: 0, vatPct: 5 }])
          }
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add line
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase text-muted-foreground">
              <th className="px-3 py-2.5 font-medium min-w-[220px]">Description</th>
              <th className="px-3 py-2.5 font-medium w-20">Qty</th>
              <th className="px-3 py-2.5 font-medium w-28">Unit</th>
              <th className="px-3 py-2.5 font-medium w-28">Rate</th>
              <th className="px-3 py-2.5 font-medium w-24">Discount</th>
              <th className="px-3 py-2.5 font-medium w-20">VAT %</th>
              <th className="px-3 py-2.5 font-medium text-right w-28">Amount</th>
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.id} className="border-b border-border/60 last:border-0">
                <td className="px-2 py-1.5"><Input value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Service description" /></td>
                <td className="px-2 py-1.5"><Input type="number" min={0} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} /></td>
                <td className="px-2 py-1.5">
                  <Select value={l.unit} onValueChange={(v) => setLine(i, { unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Container", "Job", "Trip", "Day", "Ton", "Lot"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1.5"><Input type="number" min={0} value={l.rate} onChange={(e) => setLine(i, { rate: Number(e.target.value) })} /></td>
                <td className="px-2 py-1.5"><Input type="number" min={0} value={l.discount} onChange={(e) => setLine(i, { discount: Number(e.target.value) })} /></td>
                <td className="px-2 py-1.5"><Input type="number" min={0} max={100} value={l.vatPct} onChange={(e) => setLine(i, { vatPct: Number(e.target.value) })} /></td>
                <td className="px-3 py-1.5 text-right font-medium whitespace-nowrap">{aed(lineTotal(l))}</td>
                <td className="px-2 py-1.5">
                  <Button size="sm" variant="ghost" className="text-destructive" disabled={lines.length <= 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label className="mb-1.5 block">Invoice date</Label>
          <Input type="date" value={d} onChange={(e) => setD(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block">Due date</Label>
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Notes</Label>
          <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Payment instructions, bank details…" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <div className="space-x-4">
          <span>Subtotal <strong>{aed(totals.subtotal)}</strong></span>
          <span>VAT <strong>{aed(totals.vat)}</strong></span>
          <span>Total <strong className="text-primary">{aed(totals.total)}</strong></span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Discard</Button>
          <Button
            size="sm"
            disabled={lines.length === 0 || lines.some((l) => !l.description.trim())}
            onClick={() =>
              onSave({
                date: new Date(d).toISOString(),
                dueDate: new Date(due).toISOString(),
                notes: n,
                lines,
              })
            }
          >
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}
