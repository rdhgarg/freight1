export type Role =
  | "Super Admin"
  | "Sales Manager"
  | "Operations Manager"
  | "Accounts Manager"
  | "Driver Manager"
  | "Customer Support"
  | "Viewer";

export const ALL_ROLES: Role[] = [
  "Super Admin",
  "Sales Manager",
  "Operations Manager",
  "Accounts Manager",
  "Driver Manager",
  "Customer Support",
  "Viewer",
];

export type Action = "view" | "add" | "edit" | "delete" | "export" | "approve";
export const ALL_ACTIONS: Action[] = ["view", "add", "edit", "delete", "export", "approve"];

export type ModuleKey =
  | "dashboard"
  | "customers"
  | "drivers"
  | "suppliers"
  | "workOrders"
  | "shipments"
  | "trucks"
  | "expenses"
  | "purchases"
  | "invoices"
  | "receipts"
  | "ledgers"
  | "outstanding"
  | "journal"
  | "settings"
  | "users"
  | "roles";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  active: boolean;
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  gst: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string; // e.g. "Net 30"
  creditLimit: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  license: string;
  truckId?: string;
  status: "Available" | "On Trip" | "Off Duty";
  joinedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  gst: string;
  category: string;
  services: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  paymentTerms: string;
  createdAt: string;
}

export interface Truck {
  id: string;
  number: string;
  capacityTons: number;
  driverId?: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  status: "Active" | "Maintenance" | "Retired";
}

export type WorkOrderStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Converted";
export interface WorkOrder {
  id: string;
  woNumber: string;
  customerId: string;
  containers: number;
  rate: number;
  pickup: string;
  delivery: string;
  terms: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  shipmentId?: string;
  createdAt: string;
}

export const SHIPMENT_STAGES = [
  "Customs Clearance",
  "Driver Assignment",
  "Port Activity",
  "Inspection",
  "X-Ray",
  "Out From Port",
  "In Transit",
  "Delivered",
] as const;
export type ShipmentStage = (typeof SHIPMENT_STAGES)[number];

export interface ShipmentTimelineEntry {
  id: string;
  stage: ShipmentStage;
  at: string;
  note?: string;
  by?: string;
}
export interface ShipmentDoc {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
}
export interface Shipment {
  id: string;
  shipmentNo: string;
  workOrderId: string;
  customerId: string;
  driverId?: string;
  truckId?: string;
  pickup: string;
  delivery: string;
  containers: number;
  amount: number;
  stage: ShipmentStage;
  timeline: ShipmentTimelineEntry[];
  docs: ShipmentDoc[];
  deliveryProofUrl?: string;
  createdAt: string;
  deliveredAt?: string;
}

export type ExpenseCategory =
  | "Port Charges"
  | "Toll Charges"
  | "Parking Charges"
  | "X-Ray Fees"
  | "Driver Expenses"
  | "Miscellaneous";
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Port Charges",
  "Toll Charges",
  "Parking Charges",
  "X-Ray Fees",
  "Driver Expenses",
  "Miscellaneous",
];
export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  shipmentId?: string;
  vendor?: string;
  notes?: string;
  receiptUrl?: string;
  status: "Pending" | "Approved" | "Rejected";
}

export type PurchaseStatus = "Draft" | "Pending Approval" | "Approved" | "Paid";
export interface Purchase {
  id: string;
  poNumber: string;
  supplierId: string;
  date: string;
  amount: number;
  items: string;
  status: PurchaseStatus;
  paidAmount: number;
}

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Partial";
export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  shipmentId?: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxPct: number;
  total: number;
  paid: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  invoiceId: string;
  customerId: string;
  date: string;
  amount: number;
  mode: "Cash" | "Bank Transfer" | "UPI" | "Cheque";
  reference?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  type: "Journal" | "Contra";
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
}
