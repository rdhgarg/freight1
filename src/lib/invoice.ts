import type { WorkOrder, WOInvoice, InvoiceLineItem } from "@/lib/types";
import { woMoney } from "@/lib/wo";

/* ------------------------------ line math ------------------------------ */

export const lineTaxable = (l: InvoiceLineItem) => Math.max(0, l.qty * l.rate - (l.discount || 0));
export const lineVat = (l: InvoiceLineItem) => (lineTaxable(l) * (l.vatPct || 0)) / 100;
export const lineTotal = (l: InvoiceLineItem) => lineTaxable(l) + lineVat(l);

export const invoiceTotals = (lines: InvoiceLineItem[]) => {
  const subtotal = lines.reduce((s, l) => s + lineTaxable(l), 0);
  const discount = lines.reduce((s, l) => s + (l.discount || 0), 0);
  const vatAmount = lines.reduce((s, l) => s + lineVat(l), 0);
  return { subtotal, discount, vatAmount, total: subtotal + vatAmount };
};

/* ----------------------------- status logic ----------------------------- */

/** The invoice that drives WO financials — cancelled invoices are ignored. */
export const activeInvoice = (wo: WorkOrder): WOInvoice | undefined =>
  wo.invoice && wo.invoice.status !== "Cancelled" ? wo.invoice : undefined;

/** Status derived from actual invoice + payment state (never stored arbitrarily). */
export const invoiceDisplayStatus = (inv: WOInvoice, paid: number): WOInvoice["status"] => {
  if (inv.status === "Draft" || inv.status === "Cancelled") return inv.status;
  if (inv.total > 0 && paid >= inv.total) return "Paid";
  if (paid > 0) return "Partially Paid";
  return new Date(inv.dueDate).getTime() < Date.now() ? "Overdue" : "Issued";
};

/* ------------------------------ numbering ------------------------------ */

/** Next unique INV-YYYY-NNNN, derived from every invoice number in the system. */
export const nextInvoiceNo = (wos: WorkOrder[]) => {
  const year = new Date().getFullYear();
  let max = 0;
  for (const w of wos) {
    const m = w.invoice?.invoiceNo?.match(/^INV-(\d{4})-(\d+)$/);
    if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
  }
  return `INV-${year}-${String(max + 1).padStart(4, "0")}`;
};

/* ----------------------------- validation ------------------------------ */

export const validateInvoiceForIssue = (wo: WorkOrder, customerExists: boolean): string | null => {
  const inv = wo.invoice;
  if (!inv) return "No invoice draft exists for this work order.";
  if (inv.status !== "Draft") return "Only draft invoices can be issued.";
  if (!customerExists) return "The work order's billing party no longer exists.";
  if (!inv.date) return "Invoice date is required.";
  if (!inv.dueDate) return "Due date is required.";
  const lines = inv.lines ?? [];
  if (lines.length === 0) return "Add at least one line item.";
  if (lines.some((l) => !l.description.trim())) return "Every line needs a description.";
  if (lines.some((l) => l.qty <= 0 || l.rate < 0)) return "Line quantity and rate must be valid.";
  if (lines.some((l) => l.vatPct < 0 || l.vatPct > 100)) return "VAT % must be between 0 and 100.";
  if (inv.total <= 0) return "Invoice amount must be greater than zero.";
  return null;
};

/* -------------------------------- ledger -------------------------------- */

export type LedgerType = "Invoice" | "Payment" | "Expense" | "Adjustment";

export interface LedgerEntry {
  id: string;
  date: string;
  at: string;
  type: LedgerType;
  woId: string;
  woNumber: string;
  customerId: string;
  vendorId?: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  by?: string;
}

export interface LedgerRow extends LedgerEntry {
  balance: number;
}

/**
 * Derive the complete ledger from Work Order financial records — invoices,
 * payments and approved expenses. Nothing is stored separately; the ledger
 * is always consistent with the underlying records.
 */
export function buildLedger(workOrders: WorkOrder[]): LedgerRow[] {
  const entries: LedgerEntry[] = [];
  for (const wo of workOrders) {
    const inv = wo.invoice;
    const base = { woId: wo.id, woNumber: wo.woNumber, customerId: wo.customerId, vendorId: wo.primaryVendorId };
    if (inv && inv.status !== "Draft") {
      if (inv.status === "Cancelled") {
        entries.push({
          ...base,
          id: `lg_${wo.id}_cancel`,
          date: inv.cancelledAt ?? inv.date,
          at: inv.cancelledAt ?? inv.date,
          type: "Adjustment",
          reference: inv.invoiceNo,
          description: `Invoice ${inv.invoiceNo} cancelled — reversal`,
          debit: 0,
          credit: inv.total,
          by: inv.cancelledBy,
        });
      } else {
        entries.push({
          ...base,
          id: `lg_${wo.id}_inv`,
          date: inv.issuedAt ?? inv.date,
          at: inv.issuedAt ?? inv.date,
          type: "Invoice",
          reference: inv.invoiceNo,
          description: `Tax invoice ${inv.invoiceNo} issued`,
          debit: inv.total,
          credit: 0,
          by: inv.issuedBy ?? inv.generatedBy,
        });
      }
    }
    for (const p of wo.payments ?? []) {
      entries.push({
        ...base,
        id: `lg_${p.id}`,
        date: p.date,
        at: p.date,
        type: "Payment",
        reference: p.receiptNo ?? p.reference ?? p.id,
        description: `Payment received · ${p.mode}${p.reference ? ` · ${p.reference}` : ""}`,
        debit: 0,
        credit: p.amount,
        by: p.by,
      });
    }
    for (const e of wo.woExpenses ?? []) {
      if (e.status !== "Approved") continue;
      const gross = e.amount + (e.amount * (e.vatPct ?? 0)) / 100;
      entries.push({
        ...base,
        vendorId: e.vendorId ?? wo.primaryVendorId,
        id: `lg_${e.id}`,
        date: e.date,
        at: e.date,
        type: "Expense",
        reference: e.id.toUpperCase(),
        description: `Approved expense · ${e.category}${e.vendor ? ` · ${e.vendor}` : ""}`,
        debit: gross,
        credit: 0,
        by: e.by,
      });
    }
  }
  entries.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  let balance = 0;
  return entries.map((e) => {
    balance += e.debit - e.credit;
    return { ...e, balance };
  });
}

/** Outstanding per work order, derived from invoice + payments. */
export const woOutstanding = (wo: WorkOrder) => {
  const inv = activeInvoice(wo);
  if (!inv) return 0;
  return woMoney(wo).balance;
};
