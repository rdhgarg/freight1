import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Customer, Driver, Vendor, Fleet, WorkOrder, Shipment, Expense, Purchase, Invoice, Receipt, JournalEntry,
  ShipmentStage, ShipmentTimelineEntry, WorkOrderStatus, WOActivityLog, WOApprovalEntry,
  WOOperation, WOPayment, WOExpenseItem, WOTimelineEntry,
} from "@/lib/types";
import { WO_LIFECYCLE } from "@/lib/types";
import {
  seedCustomers, seedDrivers, seedVendors, seedFleet, seedWorkOrders,
  seedShipments, seedExpenses, seedPurchases, seedInvoices, seedReceipts, seedJournal,
} from "@/lib/seed";
import { uid } from "@/lib/format";

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

  // WO workspace actions
  advanceWOStatus: (id: string, next: WorkOrderStatus, by: string, note?: string) => void;
  assignDriverToWO: (id: string, driverId: string, fleetId?: string, by?: string) => void;
  toggleWOOperation: (id: string, stage: WorkOrderStatus, by: string, note?: string) => void;
  addWOExpense: (id: string, entry: Omit<WOExpenseItem, "id">) => void;
  addWOPayment: (id: string, entry: Omit<WOPayment, "id">) => void;
  generateInvoiceForWO: (id: string, by: string) => void;

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

const markOpDone = (ops: WOOperation[] | undefined, stage: WorkOrderStatus, by: string, note?: string): WOOperation[] => {
  const base = ops ?? WO_LIFECYCLE.filter((s) => s !== "Draft").map((s) => ({ id: uid("op_"), stage: s, completed: false } as WOOperation));
  return base.map((o) => (o.stage === stage ? { ...o, completed: true, completedAt: new Date().toISOString(), by, note } : o));
};

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
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
      upsertVendor: (v) => upserter<Vendor>("vendors")(set, get)(v),
      deleteVendor: (id) => deleter<Vendor>("vendors")(set, get)(id),
      upsertFleet: (f) => upserter<Fleet>("fleet")(set, get)(f),
      deleteFleet: (id) => deleter<Fleet>("fleet")(set, get)(id),

      upsertWorkOrder: (w) => upserter<WorkOrder>("workOrders")(set, get)(w),
      deleteWorkOrder: (id) => deleter<WorkOrder>("workOrders")(set, get)(id),
      transitionWorkOrder: (id, next, by, note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: next };
            const a = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: `Status → ${next}`, note });
            return appendTimeline(a, { id: uid("tl_"), stage: next, at: new Date().toISOString(), by, note });
          }),
        });
      },
      approveWorkOrder: (id, by = "System", note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: "Approved" as WorkOrderStatus };
            const a = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: "Approved", note });
            const ap = appendApproval(a, { id: uid("ap_"), at: new Date().toISOString(), by, decision: "Approved", note });
            return appendTimeline(ap, { id: uid("tl_"), stage: "Approved", at: new Date().toISOString(), by, note });
          }),
        });
      },
      rejectWorkOrder: (id, by = "System", note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: "Rejected" as WorkOrderStatus };
            const a = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: "Rejected", note });
            return appendApproval(a, { id: uid("ap_"), at: new Date().toISOString(), by, decision: "Rejected", note });
          }),
        });
      },
      sendBackWorkOrder: (id, by = "System", note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: "Sent Back" as WorkOrderStatus };
            const a = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: "Sent back for revision", note });
            return appendApproval(a, { id: uid("ap_"), at: new Date().toISOString(), by, decision: "Sent Back", note });
          }),
        });
      },
      generateShipmentFromWO: () => null, // legacy no-op — WO is the source of truth now

      advanceWOStatus: (id, next, by, note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const now = new Date().toISOString();
            const ops = markOpDone(w.ops, next, by, note);
            const upd: WorkOrder = { ...w, status: next, ops };
            const a = appendActivity(upd, { id: uid("a_"), at: now, by, action: `Advanced to ${next}`, note });
            return appendTimeline(a, { id: uid("tl_"), stage: next, at: now, by, note });
          }),
        });
      },
      assignDriverToWO: (id, driverId, fleetId, by = "System") => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const now = new Date().toISOString();
            const status: WorkOrderStatus = "Driver Assigned";
            const ops = markOpDone(w.ops, status, by, "Driver assigned");
            const upd: WorkOrder = { ...w, assignedDriverId: driverId, assignedFleetId: fleetId ?? w.assignedFleetId, status, ops };
            const a = appendActivity(upd, { id: uid("a_"), at: now, by, action: "Driver assigned" });
            return appendTimeline(a, { id: uid("tl_"), stage: status, at: now, by });
          }),
          drivers: get().drivers.map((d) => (d.id === driverId ? { ...d, status: "On Trip" } : d)),
          fleet: fleetId
            ? get().fleet.map((f) => (f.id === fleetId ? { ...f, status: "Assigned", driverId } : f))
            : get().fleet,
        });
      },
      toggleWOOperation: (id, stage, by, note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const ops = markOpDone(w.ops, stage, by, note);
            return { ...w, ops };
          }),
        });
      },
      addWOExpense: (id, entry) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const item: WOExpenseItem = { id: uid("we_"), ...entry };
            const a = appendActivity({ ...w, woExpenses: [...(w.woExpenses ?? []), item] }, {
              id: uid("a_"), at: new Date().toISOString(), by: entry.by ?? "System",
              action: `Expense added — ${entry.category}`, note: `${entry.amount}`,
            });
            return a;
          }),
        });
      },
      addWOPayment: (id, entry) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const item: WOPayment = { id: uid("wp_"), ...entry };
            const payments = [...(w.payments ?? []), item];
            const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
            const subtotal = w.containers * w.rate;
            const tax = (subtotal * (w.taxPct ?? 0)) / 100;
            const total = subtotal + tax;
            const nextStatus: WorkOrderStatus = totalPaid >= total ? "Payment Received" : "Payment Pending";
            const ops = markOpDone(w.ops, nextStatus, entry.by ?? "System", `${entry.mode} · ${entry.amount}`);
            const upd: WorkOrder = { ...w, payments, status: nextStatus, ops };
            const now = new Date().toISOString();
            const a = appendActivity(upd, { id: uid("a_"), at: now, by: entry.by ?? "System", action: `Payment received — ${entry.mode}`, note: `${entry.amount}` });
            return appendTimeline(a, { id: uid("tl_"), stage: nextStatus, at: now, by: entry.by ?? "System" });
          }),
        });
      },
      generateInvoiceForWO: (id, by) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const now = new Date().toISOString();
            const invoiceNo = w.invoiceNo ?? `INV-${new Date().getFullYear()}-${String(get().workOrders.filter((x) => x.invoiceNo).length + 1).padStart(4, "0")}`;
            const status: WorkOrderStatus = "Invoice Generated";
            const ops = markOpDone(w.ops, status, by, `Invoice ${invoiceNo}`);
            const upd: WorkOrder = { ...w, invoiceNo, invoiceGeneratedAt: now, status, ops };
            const a = appendActivity(upd, { id: uid("a_"), at: now, by, action: `Invoice ${invoiceNo} generated` });
            return appendTimeline(a, { id: uid("tl_"), stage: status, at: now, by });
          }),
        });
      },

      upsertShipment: (s) => upserter<Shipment>("shipments")(set, get)(s),
      deleteShipment: (id) => deleter<Shipment>("shipments")(set, get)(id),
      advanceShipmentStage: (id, stage, note, by) => {
        const entry: ShipmentTimelineEntry = { id: uid("tl_"), stage, at: new Date().toISOString(), note, by };
        set({
          shipments: get().shipments.map((s) =>
            s.id === id
              ? {
                  ...s,
                  stage,
                  timeline: [...s.timeline, entry],
                  deliveredAt: stage === "Delivered" ? new Date().toISOString() : s.deliveredAt,
                }
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
    }),
    {
      name: "hams-data",
      version: 3,
      migrate: (persisted: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = (persisted ?? {}) as any;
        if (s && !s.vendors && s.suppliers) s.vendors = s.suppliers;
        if (s && !s.fleet && s.trucks) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          s.fleet = (s.trucks as any[]).map((t) => ({
            id: t.id,
            registration: t.number ?? t.registration ?? "",
            vehicleType: t.vehicleType ?? "Container Truck",
            capacityTons: t.capacityTons ?? 20,
            ownership: t.ownership ?? "Owned",
            driverId: t.driverId,
            insuranceExpiry: t.insuranceExpiry,
            fitnessExpiry: t.fitnessExpiry,
            status: t.status === "Active" ? "Available" : t.status ?? "Available",
            createdAt: t.createdAt ?? new Date().toISOString(),
          }));
        }
        // Reset to fresh UAE-styled seed when migrating to v3
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
