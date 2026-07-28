import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Customer, Driver, Vendor, Fleet, WorkOrder, Shipment, Expense, Purchase, Invoice, Receipt, JournalEntry,
  ShipmentStage, ShipmentTimelineEntry, WorkOrderStatus, WOActivityLog, WOApprovalEntry,
} from "@/lib/types";
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
            const withStatus = { ...w, status: next };
            return appendActivity(withStatus, { id: uid("a_"), at: new Date().toISOString(), by, action: `Status → ${next}`, note });
          }),
        });
      },
      approveWorkOrder: (id, by = "System", note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: "Approved" as WorkOrderStatus };
            const withAct = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: "Approved", note });
            return appendApproval(withAct, { id: uid("ap_"), at: new Date().toISOString(), by, decision: "Approved", note });
          }),
        });
      },
      rejectWorkOrder: (id, by = "System", note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: "Rejected" as WorkOrderStatus };
            const withAct = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: "Rejected", note });
            return appendApproval(withAct, { id: uid("ap_"), at: new Date().toISOString(), by, decision: "Rejected", note });
          }),
        });
      },
      sendBackWorkOrder: (id, by = "System", note) => {
        set({
          workOrders: get().workOrders.map((w) => {
            if (w.id !== id) return w;
            const upd = { ...w, status: "Sent Back" as WorkOrderStatus };
            const withAct = appendActivity(upd, { id: uid("a_"), at: new Date().toISOString(), by, action: "Sent back for revision", note });
            return appendApproval(withAct, { id: uid("ap_"), at: new Date().toISOString(), by, decision: "Sent Back", note });
          }),
        });
      },
      generateShipmentFromWO: (id) => {
        const wo = get().workOrders.find((w) => w.id === id);
        if (!wo) return null;
        const canConvert = ["Approved", "Ready for Operations", "Dispatch Pending"].includes(wo.status);
        if (!canConvert) return null;
        const shipmentNo = `SH-2026-${String(get().shipments.length + 1).padStart(4, "0")}`;
        const shipment: Shipment = {
          id: uid("sh_"),
          shipmentNo,
          workOrderId: wo.id,
          customerId: wo.customerId,
          pickup: wo.pickup,
          delivery: wo.delivery,
          containers: wo.containers,
          amount: wo.containers * wo.rate,
          stage: "Customs Clearance",
          timeline: [
            { id: uid("tl_"), stage: "Customs Clearance", at: new Date().toISOString(), note: "Shipment created from work order", by: "System" },
          ],
          docs: [],
          createdAt: new Date().toISOString(),
        };
        set({
          shipments: [shipment, ...get().shipments],
          workOrders: get().workOrders.map((w) =>
            w.id === id
              ? appendActivity(
                  { ...w, status: "Trip Created", shipmentId: shipment.id },
                  { id: uid("a_"), at: new Date().toISOString(), by: "System", action: `Trip ${shipmentNo} created` },
                )
              : w,
          ),
        });
        return shipment.id;
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
      version: 2,
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
        return s;
      },
    },
  ),
);
