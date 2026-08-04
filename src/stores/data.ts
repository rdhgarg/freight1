import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Customer, Driver, Vendor, Fleet, WorkOrder, Shipment, Expense, Purchase, Invoice, Receipt, JournalEntry,
  ShipmentStage, ShipmentTimelineEntry, WorkOrderStatus, WOActivityLog, WOApprovalEntry,
  WOPayment, WOExpenseItem, WOTimelineEntry, WODoc, WOOpsTaskKey, WOOpsTask, Department,
  DriverStatus, WOInvoice,
} from "@/lib/types";
import { WO_OPS_TASKS } from "@/lib/types";
import { normalizeStatus, stageIndex } from "@/lib/wo";
import {
  seedCustomers, seedDrivers, seedVendors, seedFleet, seedWorkOrders,
  seedShipments, seedExpenses, seedPurchases, seedInvoices, seedReceipts, seedJournal,
} from "@/lib/seed";
import { uid } from "@/lib/format";

export interface Actor {
  by: string;
  department?: Department;
}

interface DataState {
  customers: Customer[];
  drivers: Driver[];
  vendors: Vendor[];
  fleet: Fleet[];
  workOrders: WorkOrder[];
  shipments: Shipment[];
  expenses: Expense[];
  purchases: Purchase[];
  invoices: Invoice[];
  receipts: Receipt[];
  journal: JournalEntry[];

  upsertCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;

  upsertDriver: (d: Driver) => void;
  deleteDriver: (id: string) => void;
  setDriverStatus: (id: string, status: DriverStatus) => void;

  upsertVendor: (v: Vendor) => void;
  deleteVendor: (id: string) => void;

  upsertFleet: (f: Fleet) => void;
  deleteFleet: (id: string) => void;

  upsertWorkOrder: (w: WorkOrder) => void;
  deleteWorkOrder: (id: string) => void;
  transitionWorkOrder: (id: string, next: WorkOrderStatus, by: string, note?: string) => void;
  approveWorkOrder: (id: string, by?: string, note?: string) => void;
  rejectWorkOrder: (id: string, by?: string, note?: string) => void;
  sendBackWorkOrder: (id: string, by?: string, note?: string) => void;
  generateShipmentFromWO: (id: string) => string | null;

  // ===== WO operational workspace =====
  setWOStage: (id: string, next: WorkOrderStatus, actor: Actor, note?: string) => void;
  advanceWOStatus: (id: string, next: WorkOrderStatus, by: string, note?: string) => void;
  toggleWOOpsTask: (id: string, key: WOOpsTaskKey, actor: Actor, remarks?: string) => void;
  setWOOpsRemarks: (id: string, remarks: string) => void;
  assignWODriver: (id: string, driverId: string, actor: Actor, note?: string) => void;
  assignWOFleet: (id: string, fleetId: string, actor: Actor, note?: string) => void;
  releaseWOAssignment: (id: string, type: "Driver" | "Fleet", actor: Actor) => void;
  assignDriverToWO: (id: string, driverId: string, fleetId?: string, by?: string) => void;
  addWODoc: (id: string, doc: Omit<WODoc, "id">, actor: Actor) => void;
  replaceWODoc: (id: string, docId: string, doc: Omit<WODoc, "id">, actor: Actor) => void;
  deleteWODoc: (id: string, docId: string, actor: Actor) => void;
  addWOExpense: (id: string, entry: Omit<WOExpenseItem, "id">, actor?: Actor) => void;
  updateWOExpenseStatus: (id: string, expenseId: string, status: "Approved" | "Rejected", actor: Actor) => void;
  deleteWOExpense: (id: string, expenseId: string, actor: Actor) => void;
  generateWOInvoice: (id: string, opts: { vatPct: number; dueDays: number; notes?: string }, actor: Actor) => void;
  generateInvoiceForWO: (id: string, by: string) => void;
  addWOPayment: (id: string, entry: Omit<WOPayment, "id">, actor?: Actor) => void;
  deleteWOPayment: (id: string, paymentId: string, actor: Actor) => void;
  addWOTimelineEvent: (id: string, entry: Omit<WOTimelineEntry, "id">) => void;

  upsertShipment: (s: Shipment) => void;
  deleteShipment: (id: string) => void;
  advanceShipmentStage: (id: string, stage: ShipmentStage, note?: string, by?: string) => void;
  assignDriver: (id: string, driverId: string, truckId?: string) => void;
  addShipmentDoc: (id: string, doc: Shipment["docs"][number]) => void;
  setDeliveryProof: (id: string, dataUrl: string) => void;

  upsertExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string) => void;

  upsertPurchase: (p: Purchase) => void;
  deletePurchase: (id: string) => void;

  upsertInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;

  upsertReceipt: (r: Receipt) => void;
  deleteReceipt: (id: string) => void;

  upsertJournal: (j: JournalEntry) => void;
  deleteJournal: (id: string) => void;

  resetAll: () => void;
}

const upserter =
  <T extends { id: string }>(key: keyof DataState) =>
  (set: (partial: Partial<DataState>) => void, get: () => DataState) =>
  (item: T) => {
    const list = (get()[key] as unknown as T[]) ?? [];
    const exists = list.some((x) => x.id === item.id);
    const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
    set({ [key]: next } as unknown as Partial<DataState>);
  };
const deleter =
  <T extends { id: string }>(key: keyof DataState) =>
  (set: (partial: Partial<DataState>) => void, get: () => DataState) =>
  (id: string) => {
    const list = (get()[key] as unknown as T[]) ?? [];
    set({ [key]: list.filter((x) => x.id !== id) } as unknown as Partial<DataState>);
  };

const now = () => new Date().toISOString();

const appendActivity = (wo: WorkOrder, entry: WOActivityLog): WorkOrder => ({
  ...wo,
  activityLog: [...(wo.activityLog ?? []), entry],
});
const appendApproval = (wo: WorkOrder, entry: WOApprovalEntry): WorkOrder => ({
  ...wo,
  approvalHistory: [...(wo.approvalHistory ?? []), entry],
});
const appendTimeline = (wo: WorkOrder, entry: WOTimelineEntry): WorkOrder => ({
  ...wo,
  woTimeline: [...(wo.woTimeline ?? []), entry],
});

/** Log an action to both the activity log and (optionally) the timeline. */
const logged = (
  wo: WorkOrder,
  actor: Actor,
  action: string,
  note?: string,
  stage?: string,
): WorkOrder => {
  const at = now();
  const withActivity = appendActivity(wo, {
    id: uid("a_"),
    at,
    by: actor.by,
    action,
    note,
    department: actor.department,
  });
  return stage
    ? appendTimeline(withActivity, { id: uid("tl_"), stage, at, by: actor.by, note: note ?? action, department: actor.department })
    : withActivity;
};

const emptyTasks = (): WOOpsTask[] => WO_OPS_TASKS.map((t) => ({ key: t.key, completed: false }));

const invoiceStatusFor = (inv: WOInvoice, paid: number): WOInvoice["status"] => {
  if (paid >= inv.total) return "Paid";
  if (paid > 0) return "Partial";
  return new Date(inv.dueDate).getTime() < Date.now() ? "Overdue" : "Sent";
};

const nextInvoiceNo = (wos: WorkOrder[]) =>
  `INV-${new Date().getFullYear()}-${String(wos.filter((w) => w.invoice || w.invoiceNo).length + 1).padStart(4, "0")}`;

const nextReceiptNo = (wos: WorkOrder[]) =>
  `RCP-${String(wos.reduce((s, w) => s + (w.payments?.length ?? 0), 0) + 1).padStart(4, "0")}`;

export const useData = create<DataState>()(
  persist(
    (set, get) => {
      /** Map a mutation across the matching work order. */
      const patchWO = (id: string, fn: (wo: WorkOrder) => WorkOrder) =>
        set({ workOrders: get().workOrders.map((w) => (w.id === id ? fn(w) : w)) });

      return {
        customers: seedCustomers,
        drivers: seedDrivers,
        vendors: seedVendors,
        fleet: seedFleet,
        workOrders: seedWorkOrders,
        shipments: seedShipments,
        expenses: seedExpenses,
        purchases: seedPurchases,
        invoices: seedInvoices,
        receipts: seedReceipts,
        journal: seedJournal,

        upsertCustomer: (c) => upserter<Customer>("customers")(set, get)(c),
        deleteCustomer: (id) => deleter<Customer>("customers")(set, get)(id),
        upsertDriver: (d) => upserter<Driver>("drivers")(set, get)(d),
        deleteDriver: (id) => deleter<Driver>("drivers")(set, get)(id),
        setDriverStatus: (id, status) =>
          set({ drivers: get().drivers.map((d) => (d.id === id ? { ...d, status } : d)) }),
        upsertVendor: (v) => upserter<Vendor>("vendors")(set, get)(v),
        deleteVendor: (id) => deleter<Vendor>("vendors")(set, get)(id),
        upsertFleet: (f) => upserter<Fleet>("fleet")(set, get)(f),
        deleteFleet: (id) => deleter<Fleet>("fleet")(set, get)(id),

        upsertWorkOrder: (w) => upserter<WorkOrder>("workOrders")(set, get)(w),
        deleteWorkOrder: (id) => deleter<WorkOrder>("workOrders")(set, get)(id),
        transitionWorkOrder: (id, next, by, note) =>
          patchWO(id, (w) => logged({ ...w, status: next }, { by }, `Status updated → ${next}`, note, next)),
        approveWorkOrder: (id, by = "System", note) =>
          patchWO(id, (w) => {
            const upd = logged({ ...w, status: "Operations Started" }, { by, department: "Management" }, "Approved", note, "Operations Started");
            return appendApproval(upd, { id: uid("ap_"), at: now(), by, decision: "Approved", note });
          }),
        rejectWorkOrder: (id, by = "System", note) =>
          patchWO(id, (w) => {
            const upd = logged({ ...w, status: "Rejected" }, { by, department: "Management" }, "Rejected", note);
            return appendApproval(upd, { id: uid("ap_"), at: now(), by, decision: "Rejected", note });
          }),
        sendBackWorkOrder: (id, by = "System", note) =>
          patchWO(id, (w) => {
            const upd = logged({ ...w, status: "Draft" }, { by, department: "Management" }, "Sent back for revision", note);
            return appendApproval(upd, { id: uid("ap_"), at: now(), by, decision: "Sent Back", note });
          }),
        generateShipmentFromWO: () => null, // legacy no-op — the WO is the source of truth

        // ================= WO workspace =================
        setWOStage: (id, next, actor, note) =>
          patchWO(id, (w) => logged({ ...w, status: next }, actor, `Status updated → ${next}`, note, next)),

        advanceWOStatus: (id, next, by, note) =>
          patchWO(id, (w) => logged({ ...w, status: next }, { by, department: "Operations" }, `Status updated → ${next}`, note, next)),

        toggleWOOpsTask: (id, key, actor, remarks) =>
          patchWO(id, (w) => {
            const tasks = (w.opsTasks?.length ? w.opsTasks : emptyTasks()).map((t) =>
              t.key === key
                ? t.completed
                  ? { ...t, completed: false, completedAt: undefined, by: undefined, department: undefined, remarks }
                  : { ...t, completed: true, completedAt: now(), by: actor.by, department: actor.department, remarks }
                : t,
            );
            const task = tasks.find((t) => t.key === key)!;
            const label = WO_OPS_TASKS.find((t) => t.key === key)?.label ?? key;
            // first completed task starts operations
            const anyDone = tasks.some((t) => t.completed);
            const status: WorkOrderStatus =
              anyDone && stageIndex(w.status) < stageIndex("Operations Started") ? "Operations Started" : normalizeStatus(w.status);
            const base: WorkOrder = { ...w, opsTasks: tasks, status };
            return logged(
              base,
              actor,
              task.completed ? `Task completed — ${label}` : `Task reopened — ${label}`,
              remarks,
              task.completed ? label : undefined,
            );
          }),

        setWOOpsRemarks: (id, remarks) => patchWO(id, (w) => ({ ...w, opsRemarks: remarks })),

        assignWODriver: (id, driverId, actor, note) => {
          const wo = get().workOrders.find((w) => w.id === id);
          const replacing = Boolean(wo?.assignedDriverId && wo.assignedDriverId !== driverId);
          const driver = get().drivers.find((d) => d.id === driverId);
          patchWO(id, (w) => {
            const status: WorkOrderStatus =
              stageIndex(w.status) < stageIndex("Driver Assigned") ? "Driver Assigned" : normalizeStatus(w.status);
            const base: WorkOrder = {
              ...w,
              assignedDriverId: driverId,
              status,
              assignmentHistory: [
                ...(w.assignmentHistory ?? []),
                { id: uid("ah_"), at: now(), type: "Driver", driverId, action: replacing ? "Replaced" : "Assigned", by: actor.by, note },
              ],
            };
            return logged(base, actor, replacing ? "Driver replaced" : "Driver assigned", note ?? driver?.name, "Driver Assigned");
          });
          set({
            drivers: get().drivers.map((d) =>
              d.id === driverId ? { ...d, status: "Assigned" } : d.id === wo?.assignedDriverId ? { ...d, status: "Available" } : d,
            ),
          });
        },

        assignWOFleet: (id, fleetId, actor, note) => {
          const wo = get().workOrders.find((w) => w.id === id);
          const replacing = Boolean(wo?.assignedFleetId && wo.assignedFleetId !== fleetId);
          const vehicle = get().fleet.find((f) => f.id === fleetId);
          patchWO(id, (w) => {
            const status: WorkOrderStatus =
              stageIndex(w.status) < stageIndex("Fleet Assigned") ? "Fleet Assigned" : normalizeStatus(w.status);
            const base: WorkOrder = {
              ...w,
              assignedFleetId: fleetId,
              status,
              assignmentHistory: [
                ...(w.assignmentHistory ?? []),
                { id: uid("ah_"), at: now(), type: "Fleet", fleetId, driverId: w.assignedDriverId, action: replacing ? "Replaced" : "Assigned", by: actor.by, note },
              ],
            };
            return logged(base, actor, replacing ? "Fleet replaced" : "Fleet assigned", note ?? vehicle?.registration, "Fleet Assigned");
          });
          set({
            fleet: get().fleet.map((f) =>
              f.id === fleetId
                ? { ...f, status: "Assigned", driverId: wo?.assignedDriverId ?? f.driverId }
                : f.id === wo?.assignedFleetId
                  ? { ...f, status: "Available" }
                  : f,
            ),
          });
        },

        releaseWOAssignment: (id, type, actor) => {
          const wo = get().workOrders.find((w) => w.id === id);
          patchWO(id, (w) => {
            const base: WorkOrder = {
              ...w,
              assignedDriverId: type === "Driver" ? undefined : w.assignedDriverId,
              assignedFleetId: type === "Fleet" ? undefined : w.assignedFleetId,
              assignmentHistory: [
                ...(w.assignmentHistory ?? []),
                {
                  id: uid("ah_"),
                  at: now(),
                  type,
                  driverId: type === "Driver" ? w.assignedDriverId : undefined,
                  fleetId: type === "Fleet" ? w.assignedFleetId : undefined,
                  action: "Released",
                  by: actor.by,
                },
              ],
            };
            return logged(base, actor, `${type} released`);
          });
          if (type === "Driver" && wo?.assignedDriverId) {
            set({ drivers: get().drivers.map((d) => (d.id === wo.assignedDriverId ? { ...d, status: "Available" } : d)) });
          }
          if (type === "Fleet" && wo?.assignedFleetId) {
            set({ fleet: get().fleet.map((f) => (f.id === wo.assignedFleetId ? { ...f, status: "Available" } : f)) });
          }
        },

        // legacy combined assignment
        assignDriverToWO: (id, driverId, fleetId, by = "System") => {
          get().assignWODriver(id, driverId, { by, department: "Fleet" });
          if (fleetId) get().assignWOFleet(id, fleetId, { by, department: "Fleet" });
        },

        addWODoc: (id, doc, actor) =>
          patchWO(id, (w) => {
            const item: WODoc = { id: uid("wd_"), ...doc };
            return logged({ ...w, docs: [...(w.docs ?? []), item] }, actor, "Document uploaded", `${item.category ?? "Other"} · ${item.name}`);
          }),

        replaceWODoc: (id, docId, doc, actor) =>
          patchWO(id, (w) =>
            logged(
              { ...w, docs: (w.docs ?? []).map((x) => (x.id === docId ? { id: docId, ...doc } : x)) },
              actor,
              "Document replaced",
              doc.name,
            ),
          ),

        deleteWODoc: (id, docId, actor) =>
          patchWO(id, (w) => {
            const removed = (w.docs ?? []).find((x) => x.id === docId);
            return logged({ ...w, docs: (w.docs ?? []).filter((x) => x.id !== docId) }, actor, "Document deleted", removed?.name);
          }),

        addWOExpense: (id, entry, actor) =>
          patchWO(id, (w) => {
            const item: WOExpenseItem = { id: uid("we_"), status: "Pending", ...entry };
            const a: Actor = actor ?? { by: entry.by ?? "System", department: "Operations" };
            return logged({ ...w, woExpenses: [...(w.woExpenses ?? []), item] }, a, "Expense added", `${item.category} · AED ${item.amount}`);
          }),

        updateWOExpenseStatus: (id, expenseId, status, actor) =>
          patchWO(id, (w) => {
            const item = (w.woExpenses ?? []).find((e) => e.id === expenseId);
            return logged(
              { ...w, woExpenses: (w.woExpenses ?? []).map((e) => (e.id === expenseId ? { ...e, status } : e)) },
              actor,
              `Expense ${status.toLowerCase()}`,
              item ? `${item.category} · AED ${item.amount}` : undefined,
            );
          }),

        deleteWOExpense: (id, expenseId, actor) =>
          patchWO(id, (w) => {
            const item = (w.woExpenses ?? []).find((e) => e.id === expenseId);
            return logged(
              { ...w, woExpenses: (w.woExpenses ?? []).filter((e) => e.id !== expenseId) },
              actor,
              "Expense deleted",
              item ? `${item.category} · AED ${item.amount}` : undefined,
            );
          }),

        generateWOInvoice: (id, opts, actor) => {
          const invoiceNo = nextInvoiceNo(get().workOrders);
          patchWO(id, (w) => {
            const subtotal = w.containers * w.rate;
            const vatAmount = (subtotal * opts.vatPct) / 100;
            const date = now();
            const invoice: WOInvoice = {
              invoiceNo: w.invoice?.invoiceNo ?? invoiceNo,
              date,
              dueDate: new Date(Date.now() + opts.dueDays * 86400000).toISOString(),
              subtotal,
              vatPct: opts.vatPct,
              vatAmount,
              total: subtotal + vatAmount,
              status: "Sent",
              notes: opts.notes,
              generatedBy: actor.by,
            };
            const base: WorkOrder = {
              ...w,
              invoice,
              invoiceNo: invoice.invoiceNo,
              invoiceGeneratedAt: date,
              taxPct: opts.vatPct,
              status: "Invoice Generated",
            };
            return logged(base, actor, "Invoice generated", invoice.invoiceNo, "Invoice Generated");
          });
        },

        generateInvoiceForWO: (id, by) =>
          get().generateWOInvoice(id, { vatPct: get().workOrders.find((w) => w.id === id)?.taxPct ?? 5, dueDays: 30 }, { by, department: "Accounts" }),

        addWOPayment: (id, entry, actor) => {
          const receiptNo = nextReceiptNo(get().workOrders);
          patchWO(id, (w) => {
            const item: WOPayment = { id: uid("wp_"), receiptNo, ...entry };
            const payments = [...(w.payments ?? []), item];
            const paid = payments.reduce((s, p) => s + p.amount, 0);
            const total = w.invoice?.total ?? w.containers * w.rate * (1 + (w.taxPct ?? 0) / 100);
            const status: WorkOrderStatus = paid >= total ? "Payment Received" : "Payment Pending";
            const invoice = w.invoice ? { ...w.invoice, status: invoiceStatusFor(w.invoice, paid) } : undefined;
            const a: Actor = actor ?? { by: entry.by ?? "System", department: "Accounts" };
            const base: WorkOrder = { ...w, payments, invoice, status };
            return logged(base, a, "Payment received", `AED ${entry.amount} · ${entry.mode}`, status);
          });
        },

        deleteWOPayment: (id, paymentId, actor) =>
          patchWO(id, (w) => {
            const payments = (w.payments ?? []).filter((p) => p.id !== paymentId);
            const paid = payments.reduce((s, p) => s + p.amount, 0);
            const invoice = w.invoice ? { ...w.invoice, status: invoiceStatusFor(w.invoice, paid) } : undefined;
            return logged({ ...w, payments, invoice }, actor, "Payment deleted");
          }),

        addWOTimelineEvent: (id, entry) =>
          patchWO(id, (w) => appendTimeline(w, { id: uid("tl_"), ...entry })),

        upsertShipment: (s) => upserter<Shipment>("shipments")(set, get)(s),
        deleteShipment: (id) => deleter<Shipment>("shipments")(set, get)(id),
        advanceShipmentStage: (id, stage, note, by) => {
          const entry: ShipmentTimelineEntry = { id: uid("tl_"), stage, at: now(), note, by };
          set({
            shipments: get().shipments.map((s) =>
              s.id === id
                ? { ...s, stage, timeline: [...s.timeline, entry], deliveredAt: stage === "Delivered" ? now() : s.deliveredAt }
                : s,
            ),
          });
        },
        assignDriver: (id, driverId, truckId) => {
          set({
            shipments: get().shipments.map((s) => (s.id === id ? { ...s, driverId, truckId: truckId ?? s.truckId } : s)),
            drivers: get().drivers.map((d) => (d.id === driverId ? { ...d, status: "On Trip" } : d)),
          });
        },
        addShipmentDoc: (id, doc) => {
          set({ shipments: get().shipments.map((s) => (s.id === id ? { ...s, docs: [...s.docs, doc] } : s)) });
        },
        setDeliveryProof: (id, dataUrl) => {
          set({ shipments: get().shipments.map((s) => (s.id === id ? { ...s, deliveryProofUrl: dataUrl } : s)) });
        },

        upsertExpense: (e) => upserter<Expense>("expenses")(set, get)(e),
        deleteExpense: (id) => deleter<Expense>("expenses")(set, get)(id),
        approveExpense: (id) => set({ expenses: get().expenses.map((e) => (e.id === id ? { ...e, status: "Approved" } : e)) }),
        rejectExpense: (id) => set({ expenses: get().expenses.map((e) => (e.id === id ? { ...e, status: "Rejected" } : e)) }),

        upsertPurchase: (p) => upserter<Purchase>("purchases")(set, get)(p),
        deletePurchase: (id) => deleter<Purchase>("purchases")(set, get)(id),

        upsertInvoice: (i) => upserter<Invoice>("invoices")(set, get)(i),
        deleteInvoice: (id) => deleter<Invoice>("invoices")(set, get)(id),

        upsertReceipt: (r) => upserter<Receipt>("receipts")(set, get)(r),
        deleteReceipt: (id) => deleter<Receipt>("receipts")(set, get)(id),

        upsertJournal: (j) => upserter<JournalEntry>("journal")(set, get)(j),
        deleteJournal: (id) => deleter<JournalEntry>("journal")(set, get)(id),

        resetAll: () =>
          set({
            customers: seedCustomers,
            drivers: seedDrivers,
            vendors: seedVendors,
            fleet: seedFleet,
            workOrders: seedWorkOrders,
            shipments: seedShipments,
            expenses: seedExpenses,
            purchases: seedPurchases,
            invoices: seedInvoices,
            receipts: seedReceipts,
            journal: seedJournal,
          }),
      };
    },
    {
      name: "hams-data",
      version: 4,
      // Phase 3 reshapes the work-order record; start from the current seed set.
      migrate: (persisted: unknown) => {
        const s = (persisted ?? {}) as Record<string, unknown>;
        return {
          ...s,
          customers: seedCustomers,
          vendors: seedVendors,
          drivers: seedDrivers,
          fleet: seedFleet,
          workOrders: seedWorkOrders,
          shipments: seedShipments,
          expenses: seedExpenses,
          purchases: seedPurchases,
          invoices: seedInvoices,
          receipts: seedReceipts,
          journal: seedJournal,
        };
      },
    },
  ),
);
