import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Customer, Driver, Supplier, Truck, WorkOrder, Shipment, Expense, Purchase, Invoice, Receipt, JournalEntry,
  ShipmentStage, ShipmentTimelineEntry,
} from "@/lib/types";
import {
  seedCustomers, seedDrivers, seedSuppliers, seedTrucks, seedWorkOrders,
  seedShipments, seedExpenses, seedPurchases, seedInvoices, seedReceipts, seedJournal,
} from "@/lib/seed";
import { uid } from "@/lib/format";

interface DataState {
  customers: Customer[];
  drivers: Driver[];
  suppliers: Supplier[];
  trucks: Truck[];
  workOrders: WorkOrder[];
  shipments: Shipment[];
  expenses: Expense[];
  purchases: Purchase[];
  invoices: Invoice[];
  receipts: Receipt[];
  journal: JournalEntry[];

  // customers
  upsertCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;

  // drivers
  upsertDriver: (d: Driver) => void;
  deleteDriver: (id: string) => void;

  // suppliers
  upsertSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // trucks
  upsertTruck: (t: Truck) => void;
  deleteTruck: (id: string) => void;

  // work orders
  upsertWorkOrder: (w: WorkOrder) => void;
  deleteWorkOrder: (id: string) => void;
  approveWorkOrder: (id: string) => void;
  rejectWorkOrder: (id: string) => void;
  generateShipmentFromWO: (id: string) => string | null;

  // shipments
  upsertShipment: (s: Shipment) => void;
  deleteShipment: (id: string) => void;
  advanceShipmentStage: (id: string, stage: ShipmentStage, note?: string, by?: string) => void;
  assignDriver: (id: string, driverId: string, truckId?: string) => void;
  addShipmentDoc: (id: string, doc: Shipment["docs"][number]) => void;
  setDeliveryProof: (id: string, dataUrl: string) => void;

  // expenses
  upsertExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string) => void;

  // purchases
  upsertPurchase: (p: Purchase) => void;
  deletePurchase: (id: string) => void;

  // invoices
  upsertInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;

  // receipts
  upsertReceipt: (r: Receipt) => void;
  deleteReceipt: (id: string) => void;

  // journal
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

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      customers: seedCustomers,
      drivers: seedDrivers,
      suppliers: seedSuppliers,
      trucks: seedTrucks,
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

      upsertSupplier: (s) => upserter<Supplier>("suppliers")(set, get)(s),
      deleteSupplier: (id) => deleter<Supplier>("suppliers")(set, get)(id),

      upsertTruck: (t) => upserter<Truck>("trucks")(set, get)(t),
      deleteTruck: (id) => deleter<Truck>("trucks")(set, get)(id),

      upsertWorkOrder: (w) => upserter<WorkOrder>("workOrders")(set, get)(w),
      deleteWorkOrder: (id) => deleter<WorkOrder>("workOrders")(set, get)(id),
      approveWorkOrder: (id) => {
        set({ workOrders: get().workOrders.map((w) => (w.id === id ? { ...w, status: "Approved" } : w)) });
      },
      rejectWorkOrder: (id) => {
        set({ workOrders: get().workOrders.map((w) => (w.id === id ? { ...w, status: "Rejected" } : w)) });
      },
      generateShipmentFromWO: (id) => {
        const wo = get().workOrders.find((w) => w.id === id);
        if (!wo || wo.status !== "Approved") return null;
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
          workOrders: get().workOrders.map((w) => (w.id === id ? { ...w, status: "Converted", shipmentId: shipment.id } : w)),
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
          suppliers: seedSuppliers,
          trucks: seedTrucks,
          workOrders: seedWorkOrders,
          shipments: seedShipments,
          expenses: seedExpenses,
          purchases: seedPurchases,
          invoices: seedInvoices,
          receipts: seedReceipts,
          journal: seedJournal,
        }),
    }),
    { name: "hams-data" },
  ),
);
