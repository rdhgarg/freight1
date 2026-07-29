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
  | "vendors"
  | "suppliers"
  | "workOrders"
  | "shipments"
  | "fleet"
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
  paymentTerms: string;
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

// ================= Vendor (formerly Supplier) =================
export type VendorCategory =
  | "Transport"
  | "Customs"
  | "Forwarder"
  | "Port Handling"
  | "Warehouse"
  | "Inspection"
  | "Fuel"
  | "Other";
export const VENDOR_CATEGORIES: VendorCategory[] = [
  "Transport",
  "Customs",
  "Forwarder",
  "Port Handling",
  "Warehouse",
  "Inspection",
  "Fuel",
  "Other",
];

export interface Vendor {
  id: string;
  name: string;
  code: string;
  category: VendorCategory;
  gst: string;
  services: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  paymentTerms: string;
  rating?: number; // 1-5
  status: "Active" | "Inactive" | "Blacklisted";
  createdAt: string;
}

// Backward-compat alias
export type Supplier = Vendor;

// ================= Fleet (formerly Truck) =================
export type FleetVehicleType = "Trailer 20ft" | "Trailer 40ft" | "Container Truck" | "Open Truck" | "Tanker" | "LCV";
export const FLEET_VEHICLE_TYPES: FleetVehicleType[] = [
  "Trailer 20ft",
  "Trailer 40ft",
  "Container Truck",
  "Open Truck",
  "Tanker",
  "LCV",
];
export type FleetOwnership = "Owned" | "Attached" | "Market Hire";
export type FleetStatus = "Available" | "Assigned" | "Maintenance" | "Retired";

export interface Fleet {
  id: string;
  registration: string; // e.g. MH 04 AB 1234
  vehicleType: FleetVehicleType;
  capacityTons: number;
  ownership: FleetOwnership;
  ownerName?: string;
  driverId?: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  permitExpiry?: string;
  pucExpiry?: string;
  odometerKm?: number;
  status: FleetStatus;
  createdAt: string;
}

// Backward-compat alias
export type Truck = Fleet & { number?: string };

// ================= Work Order v2 =================
export type WorkOrderStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Pending Approval"
  | "Approved"
  | "Ready for Operations"
  | "Dispatch Pending"
  | "Trip Created"
  | "Converted"
  | "Completed"
  | "Operations Started"
  | "Driver Assigned"
  | "Reached Port"
  | "Inspection"
  | "X-Ray"
  | "Container Picked"
  | "Out From Port"
  | "Reached Delivery"
  | "Delivered"
  | "Invoice Generated"
  | "Payment Pending"
  | "Payment Received"
  | "Closed"
  | "Sent Back"
  | "Rejected";

export const WO_LIFECYCLE: WorkOrderStatus[] = [
  "Draft",
  "Approved",
  "Operations Started",
  "Driver Assigned",
  "Reached Port",
  "Inspection",
  "X-Ray",
  "Container Picked",
  "Out From Port",
  "Reached Delivery",
  "Delivered",
  "Invoice Generated",
  "Payment Pending",
  "Payment Received",
  "Closed",
];
export const WO_STATUS_FLOW: WorkOrderStatus[] = WO_LIFECYCLE;

export interface WOOperation {
  id: string;
  stage: WorkOrderStatus;
  completed: boolean;
  completedAt?: string;
  by?: string;
  note?: string;
}
export interface WOPayment {
  id: string;
  date: string;
  amount: number;
  mode: "Cash" | "Bank Transfer" | "Cheque" | "Card" | "UPI";
  reference?: string;
  by?: string;
}
export interface WOExpenseItem {
  id: string;
  date: string;
  category: string;
  amount: number;
  vendor?: string;
  notes?: string;
  by?: string;
}
export interface WOTimelineEntry {
  id: string;
  stage: WorkOrderStatus;
  at: string;
  note?: string;
  by?: string;
}

export type WorkOrderPriority = "Low" | "Normal" | "High" | "Urgent";
export type CargoType = "FCL" | "LCL" | "Bulk" | "Break-Bulk" | "Reefer" | "Hazardous";
export type ContainerType = "20ft GP" | "40ft GP" | "40ft HC" | "20ft Reefer" | "40ft Reefer" | "Flat Rack" | "Open Top";

export interface WOActivityLog {
  id: string;
  at: string;
  by: string;
  action: string;
  note?: string;
}
export interface WOApprovalEntry {
  id: string;
  at: string;
  by: string;
  decision: "Submitted" | "Approved" | "Rejected" | "Sent Back";
  note?: string;
}
export interface WODoc {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  customerId: string;
  customerRef?: string; // client reference no.

  // cargo & container
  cargoType?: CargoType;
  commodity?: string;
  containerType?: ContainerType;
  containers: number;
  weightTons?: number;
  volumeCbm?: number;

  // shipping
  shippingLine?: string;
  vessel?: string;
  voyage?: string;
  blNumber?: string;
  deliveryOrderNo?: string;
  port?: string;
  terminal?: string;

  // route
  pickup: string;
  delivery: string;
  deliveryContactName?: string;
  deliveryContactPhone?: string;

  // commercial
  rate: number;
  currency?: "AED" | "INR" | "USD" | "EUR";
  taxPct?: number; // VAT %
  billingTerms?: string;
  terms: string;

  // schedule
  priority?: WorkOrderPriority;
  startDate: string;
  endDate: string;
  requiredDeliveryDate?: string;

  // vendor & assignment
  primaryVendorId?: string;
  assignedDriverId?: string;
  assignedFleetId?: string;

  // status
  status: WorkOrderStatus;
  shipmentId?: string;
  remarks?: string;

  // WO workspace state
  ops?: WOOperation[];
  woTimeline?: WOTimelineEntry[];
  woExpenses?: WOExpenseItem[];
  payments?: WOPayment[];
  invoiceNo?: string;
  invoiceGeneratedAt?: string;

  // logs
  activityLog?: WOActivityLog[];
  approvalHistory?: WOApprovalEntry[];
  docs?: WODoc[];

  createdAt: string;
  createdBy?: string;
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

// Reference data
export const SHIPPING_LINES = [
  "Maersk",
  "MSC",
  "CMA CGM",
  "Hapag-Lloyd",
  "ONE",
  "Evergreen",
  "COSCO",
  "ZIM",
];
export const INDIAN_PORTS = [
  "JNPT (Nhava Sheva)",
  "Mundra",
  "Kandla",
  "Chennai",
  "Krishnapatnam",
  "Cochin",
  "Visakhapatnam",
  "Tuticorin",
  "Hazira",
  "Pipavav",
  "Kolkata",
  "ICD Tughlakabad",
  "ICD Dadri",
];
export const CONTAINER_TYPES: ContainerType[] = [
  "20ft GP",
  "40ft GP",
  "40ft HC",
  "20ft Reefer",
  "40ft Reefer",
  "Flat Rack",
  "Open Top",
];
export const CARGO_TYPES: CargoType[] = ["FCL", "LCL", "Bulk", "Break-Bulk", "Reefer", "Hazardous"];
