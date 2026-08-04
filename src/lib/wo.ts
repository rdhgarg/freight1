import type { WorkOrder, WorkOrderStatus, Department, Role } from "@/lib/types";
import { WO_LIFECYCLE, LEGACY_STATUS_MAP, ROLE_DEPARTMENT, WO_OPS_TASKS } from "@/lib/types";

/** Normalise any (possibly legacy) status to a stage in the current lifecycle. */
export const normalizeStatus = (s: string): WorkOrderStatus =>
  (WO_LIFECYCLE.includes(s as WorkOrderStatus) ? (s as WorkOrderStatus) : (LEGACY_STATUS_MAP[s] ?? "Draft"));

export const stageIndex = (s: string) => WO_LIFECYCLE.indexOf(normalizeStatus(s));

export const nextStage = (s: string): WorkOrderStatus | null => {
  const i = stageIndex(s);
  return i >= 0 ? (WO_LIFECYCLE[i + 1] ?? null) : null;
};

export const prevStage = (s: string): WorkOrderStatus | null => {
  const i = stageIndex(s);
  return i > 0 ? WO_LIFECYCLE[i - 1] : null;
};

/**
 * Valid transition: one step forward, or one step back (correction).
 * Super Admin may jump to any stage.
 */
export const canTransition = (from: string, to: string, role?: Role) => {
  const a = stageIndex(from);
  const b = stageIndex(to);
  if (a < 0 || b < 0 || a === b) return false;
  if (role === "Super Admin") return true;
  return b === a + 1 || b === a - 1;
};

export const departmentFor = (role?: Role): Department => (role ? (ROLE_DEPARTMENT[role] ?? "System") : "System");

export interface WOMoney {
  subtotal: number;
  vatPct: number;
  vat: number;
  total: number;
  paid: number;
  balance: number;
  expenses: number;
  expensesVat: number;
  expensesGrand: number;
  margin: number;
}

export const woMoney = (wo: WorkOrder): WOMoney => {
  const subtotal = wo.invoice?.subtotal ?? wo.containers * wo.rate;
  const vatPct = wo.invoice?.vatPct ?? wo.taxPct ?? 5;
  const vat = wo.invoice?.vatAmount ?? (subtotal * vatPct) / 100;
  const total = wo.invoice?.total ?? subtotal + vat;
  const paid = (wo.payments ?? []).reduce((s, p) => s + p.amount, 0);
  const items = wo.woExpenses ?? [];
  const expenses = items.reduce((s, e) => s + e.amount, 0);
  const expensesVat = items.reduce((s, e) => s + (e.amount * (e.vatPct ?? 0)) / 100, 0);
  return {
    subtotal,
    vatPct,
    vat,
    total,
    paid,
    balance: Math.max(0, total - paid),
    expenses,
    expensesVat,
    expensesGrand: expenses + expensesVat,
    margin: total - (expenses + expensesVat),
  };
};

export const progressPct = (status: string) => {
  const i = stageIndex(status);
  return Math.round(((i < 0 ? 0 : i) / (WO_LIFECYCLE.length - 1)) * 100);
};

export const opsTaskLabel = (key: string) => WO_OPS_TASKS.find((t) => t.key === key)?.label ?? key;

/** Read a File into a data URL (localStorage-friendly mock storage). */
export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
