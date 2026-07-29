import type {
  Customer, Driver, Vendor, Fleet, WorkOrder, Shipment, Expense, Purchase, Invoice, Receipt, JournalEntry, User,
} from "./types";
import { SHIPMENT_STAGES, WO_LIFECYCLE } from "./types";

const d = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString();

const opsFor = (upTo: string): WorkOrder["ops"] => {
  const idx = WO_LIFECYCLE.indexOf(upTo as never);
  return WO_LIFECYCLE.filter((s) => s !== "Draft").map((stage, i) => ({
    id: `op_${stage}`,
    stage,
    completed: idx > 0 && WO_LIFECYCLE.indexOf(stage) <= idx,
    completedAt: idx > 0 && WO_LIFECYCLE.indexOf(stage) <= idx ? d(-30 + i) : undefined,
    by: "Ops team",
  }));
};

export const seedUsers: User[] = [
  { id: "u1", name: "Ahmed Al Mansouri", email: "admin@hams.ae", role: "Super Admin", active: true, password: "admin123", phone: "+971 50 100 0001" },
  { id: "u2", name: "Fatima Al Zaabi", email: "sales@hams.ae", role: "Sales Manager", active: true, password: "demo1234", phone: "+971 50 100 0002" },
  { id: "u3", name: "Rashid Khan", email: "ops@hams.ae", role: "Operations Manager", active: true, password: "demo1234", phone: "+971 50 100 0003" },
  { id: "u4", name: "Layla Hassan", email: "accounts@hams.ae", role: "Accounts Manager", active: true, password: "demo1234", phone: "+971 50 100 0004" },
  { id: "u5", name: "Omar Bin Sulayem", email: "drivers@hams.ae", role: "Driver Manager", active: true, password: "demo1234", phone: "+971 50 100 0005" },
  { id: "u6", name: "Noor Al Shamsi", email: "support@hams.ae", role: "Customer Support", active: true, password: "demo1234", phone: "+971 50 100 0006" },
  { id: "u7", name: "Read Only", email: "viewer@hams.ae", role: "Viewer", active: true, password: "demo1234" },
];

export const seedCustomers: Customer[] = [
  { id: "c1", name: "Khalid Al Marri", company: "Gulf Blue Trading LLC", gst: "100234567800003", email: "ops@gulfblue.ae", phone: "+971 4 555 1122", address: "Al Quoz Industrial Area, Dubai", paymentTerms: "Net 30", creditLimit: 850000, status: "Active", createdAt: d(-120) },
  { id: "c2", name: "Aisha Al Rashid", company: "Meridian Trading FZE", gst: "100345678900003", email: "accounts@meridian.ae", phone: "+971 4 555 2233", address: "JAFZA, Jebel Ali, Dubai", paymentTerms: "Net 45", creditLimit: 620000, status: "Active", createdAt: d(-90) },
  { id: "c3", name: "Yousef Bin Rashed", company: "Crescent Logistics DMCC", gst: "100456789000003", email: "hello@crescent.ae", phone: "+971 4 555 3344", address: "JLT Cluster F, Dubai", paymentTerms: "Net 15", creditLimit: 300000, status: "Active", createdAt: d(-60) },
  { id: "c4", name: "Mariam Al Suwaidi", company: "Northline Freight LLC", gst: "100567890100003", email: "info@northline.ae", phone: "+971 2 555 4455", address: "Mussafah, Abu Dhabi", paymentTerms: "Net 30", creditLimit: 450000, status: "Inactive", createdAt: d(-200) },
  { id: "c5", name: "Hamdan Al Falasi", company: "Southstar Cargo LLC", gst: "100678901200003", email: "hamdan@southstar.ae", phone: "+971 6 555 5566", address: "Hamriyah Free Zone, Sharjah", paymentTerms: "Net 30", creditLimit: 700000, status: "Active", createdAt: d(-45) },
];

export const seedDrivers: Driver[] = [
  { id: "dr1", name: "Iqbal Rahman", mobile: "+971 55 900 1111", license: "DXB-DL-2020-1234", truckId: "t1", status: "On Trip", joinedAt: d(-300) },
  { id: "dr2", name: "Suresh Kumar", mobile: "+971 55 900 2222", license: "DXB-DL-2021-4567", truckId: "t2", status: "Available", joinedAt: d(-200) },
  { id: "dr3", name: "Mohammed Aslam", mobile: "+971 55 900 3333", license: "AUH-DL-2019-8901", truckId: "t3", status: "Available", joinedAt: d(-500) },
  { id: "dr4", name: "Ravi Pillai", mobile: "+971 55 900 4444", license: "SHJ-DL-2022-2345", status: "Off Duty", joinedAt: d(-100) },
  { id: "dr5", name: "Bilal Ahmed", mobile: "+971 55 900 5555", license: "DXB-DL-2020-6789", truckId: "t4", status: "On Trip", joinedAt: d(-400) },
];

export const seedFleet: Fleet[] = [
  { id: "t1", registration: "DXB A 12345", vehicleType: "Trailer 40ft", capacityTons: 25, ownership: "Owned", driverId: "dr1", insuranceExpiry: d(180), fitnessExpiry: d(360), permitExpiry: d(210), pucExpiry: d(60), odometerKm: 154000, status: "Assigned", createdAt: d(-720) },
  { id: "t2", registration: "DXB B 56789", vehicleType: "Container Truck", capacityTons: 16, ownership: "Owned", driverId: "dr2", insuranceExpiry: d(90), fitnessExpiry: d(200), permitExpiry: d(150), pucExpiry: d(30), odometerKm: 98000, status: "Available", createdAt: d(-500) },
  { id: "t3", registration: "AUH C 90123", vehicleType: "Trailer 20ft", capacityTons: 22, ownership: "Attached", ownerName: "Al Barsha Transport", driverId: "dr3", insuranceExpiry: d(45), fitnessExpiry: d(150), permitExpiry: d(90), pucExpiry: d(15), odometerKm: 220000, status: "Available", createdAt: d(-900) },
  { id: "t4", registration: "SHJ D 34567", vehicleType: "Container Truck", capacityTons: 18, ownership: "Owned", driverId: "dr5", insuranceExpiry: d(-10), fitnessExpiry: d(60), permitExpiry: d(-5), pucExpiry: d(-2), odometerKm: 176000, status: "Assigned", createdAt: d(-600) },
  { id: "t5", registration: "DXB E 78901", vehicleType: "Tanker", capacityTons: 22, ownership: "Market Hire", ownerName: "Prime Logistics FZ", insuranceExpiry: d(300), fitnessExpiry: d(400), permitExpiry: d(300), pucExpiry: d(120), odometerKm: 44000, status: "Maintenance", createdAt: d(-200) },
  { id: "t6", registration: "AJM F 44556", vehicleType: "Trailer 40ft", capacityTons: 28, ownership: "Owned", insuranceExpiry: d(220), fitnessExpiry: d(320), permitExpiry: d(180), pucExpiry: d(80), odometerKm: 12000, status: "Available", createdAt: d(-60) },
];
export const seedTrucks = seedFleet;

export const seedVendors: Vendor[] = [
  { id: "s1", name: "PortEdge Services LLC", code: "V-0001", category: "Port Handling", gst: "100789012300003", services: "Customs, Handling, Storage", address: "Jebel Ali Port, Dubai", contactName: "Girish Patel", contactPhone: "+971 55 010 0001", contactEmail: "ops@portedge.ae", paymentTerms: "Net 15", rating: 4.5, status: "Active", createdAt: d(-250) },
  { id: "s2", name: "FuelMart UAE", code: "V-0002", category: "Fuel", gst: "100890123400003", services: "Diesel, Lubricants", address: "Ras Al Khor, Dubai", contactName: "Nitin Sharma", contactPhone: "+971 55 020 0002", contactEmail: "sales@fuelmart.ae", paymentTerms: "Net 7", rating: 4.2, status: "Active", createdAt: d(-180) },
  { id: "s3", name: "SafeInspect FZ", code: "V-0003", category: "Inspection", gst: "100901234500003", services: "Container inspection, X-Ray", address: "Khalifa Port, Abu Dhabi", contactName: "Rita Joshi", contactPhone: "+971 55 030 0003", contactEmail: "info@safeinspect.ae", paymentTerms: "Net 30", rating: 4.0, status: "Active", createdAt: d(-140) },
  { id: "s4", name: "Trans Global CHA", code: "V-0004", category: "Customs", gst: "101012345600003", services: "Customs clearance, Documentation", address: "Deira, Dubai", contactName: "Anil Deshmukh", contactPhone: "+971 55 040 0004", contactEmail: "ops@transglobal.ae", paymentTerms: "Net 30", rating: 4.6, status: "Active", createdAt: d(-320) },
  { id: "s5", name: "SpeedRoad Carriers LLC", code: "V-0005", category: "Transport", gst: "101123456700003", services: "Trailer & container transport", address: "Al Quoz, Dubai", contactName: "Kishan Patel", contactPhone: "+971 55 050 0005", contactEmail: "ops@speedroad.ae", paymentTerms: "Net 15", rating: 4.3, status: "Active", createdAt: d(-410) },
  { id: "s6", name: "OceanBridge Forwarders", code: "V-0006", category: "Forwarder", gst: "101234567800003", services: "Sea freight forwarding", address: "DIFC, Dubai", contactName: "Meera Nair", contactPhone: "+971 55 060 0006", contactEmail: "hello@oceanbridge.ae", paymentTerms: "Net 45", rating: 4.4, status: "Active", createdAt: d(-500) },
  { id: "s7", name: "Cargo Depot Warehousing", code: "V-0007", category: "Warehouse", gst: "101345678900003", services: "Bonded warehouse, storage", address: "Hamriyah FZ, Sharjah", contactName: "Suresh Rao", contactPhone: "+971 55 070 0007", contactEmail: "ops@cargodepot.ae", paymentTerms: "Net 30", rating: 3.9, status: "Active", createdAt: d(-150) },
];
export const seedSuppliers = seedVendors;

const makeTimeline = (upto: number) =>
  SHIPMENT_STAGES.slice(0, upto).map((s, i) => ({ id: `tl_${i}_${s}`, stage: s, at: d(-30 + i * 2), note: `${s} completed`, by: "Ops team" }));

export const seedWorkOrders: WorkOrder[] = [
  {
    id: "w1", woNumber: "WO-2026-0001", customerId: "c1", customerRef: "GB/IMP/2026/145",
    cargoType: "FCL", commodity: "Textiles", containerType: "40ft HC", containers: 4, weightTons: 22, volumeCbm: 60,
    shippingLine: "Maersk", vessel: "MV Maersk Halifax", voyage: "MH-224E", blNumber: "MAEU2245678", deliveryOrderNo: "DO-88123",
    port: "Jebel Ali Port", terminal: "T3",
    pickup: "Jebel Ali Port, Dubai", delivery: "Al Quoz Warehouse, Dubai",
    deliveryContactName: "Ramesh (GB WH)", deliveryContactPhone: "+971 50 300 1112",
    rate: 8500, currency: "AED", taxPct: 5, billingTerms: "Net 30", terms: "Door delivery, unloading included",
    priority: "High", startDate: d(-30), endDate: d(-25), requiredDeliveryDate: d(-24),
    primaryVendorId: "s5", assignedDriverId: "dr1", assignedFleetId: "t1",
    status: "Payment Received",
    ops: opsFor("Payment Received"),
    woTimeline: WO_LIFECYCLE.filter((_, i) => i <= WO_LIFECYCLE.indexOf("Payment Received")).map((stage, i) => ({ id: `tl_${i}`, stage, at: d(-30 + i * 2), by: "Ops team" })),
    woExpenses: [
      { id: "we1", date: d(-28), category: "Port Charges", amount: 1850, vendor: "PortEdge Services LLC" },
      { id: "we2", date: d(-26), category: "Toll Charges", amount: 320 },
      { id: "we3", date: d(-25), category: "Driver Expenses", amount: 450, notes: "Food & lodging" },
    ],
    payments: [{ id: "wp1", date: d(-2), amount: 35700, mode: "Bank Transfer", reference: "NEFT-88123", by: "Layla Hassan" }],
    invoiceNo: "INV-2026-0001", invoiceGeneratedAt: d(-14),
    activityLog: [
      { id: "a1", at: d(-32), by: "Fatima Al Zaabi", action: "WO created" },
      { id: "a2", at: d(-31), by: "Rashid Khan", action: "Approved" },
      { id: "a3", at: d(-14), by: "Layla Hassan", action: "Invoice INV-2026-0001 generated" },
      { id: "a4", at: d(-2), by: "Layla Hassan", action: "Payment received — Bank Transfer" },
    ],
    approvalHistory: [
      { id: "ap1", at: d(-32), by: "Fatima Al Zaabi", decision: "Submitted" },
      { id: "ap2", at: d(-31), by: "Rashid Khan", decision: "Approved", note: "Approved with priority" },
    ],
    createdAt: d(-32), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w2", woNumber: "WO-2026-0002", customerId: "c2", customerRef: "MT/JAF/998",
    cargoType: "FCL", commodity: "Auto Parts", containerType: "20ft GP", containers: 2, weightTons: 12,
    shippingLine: "CMA CGM", vessel: "CMA CGM Louvre", voyage: "CGM-11N", blNumber: "CMDU9987654",
    port: "Khalifa Port (Abu Dhabi)", terminal: "KP2",
    pickup: "Khalifa Port, Abu Dhabi", delivery: "Mussafah Industrial, Abu Dhabi",
    rate: 6200, currency: "AED", taxPct: 5, terms: "Standard 24hr free time",
    priority: "Normal", startDate: d(-20), endDate: d(-18),
    primaryVendorId: "s4", assignedDriverId: "dr5", assignedFleetId: "t4",
    status: "Out From Port",
    ops: opsFor("Out From Port"),
    woTimeline: WO_LIFECYCLE.filter((_, i) => i <= WO_LIFECYCLE.indexOf("Out From Port")).map((stage, i) => ({ id: `tl2_${i}`, stage, at: d(-20 + i), by: "Ops team" })),
    woExpenses: [{ id: "we4", date: d(-19), category: "X-Ray Fees", amount: 650, vendor: "SafeInspect FZ" }],
    payments: [],
    activityLog: [{ id: "a5", at: d(-22), by: "Fatima Al Zaabi", action: "WO created" }],
    approvalHistory: [
      { id: "ap3", at: d(-22), by: "Fatima Al Zaabi", decision: "Submitted" },
      { id: "ap4", at: d(-21), by: "Rashid Khan", decision: "Approved" },
    ],
    createdAt: d(-22), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w3", woNumber: "WO-2026-0003", customerId: "c3", customerRef: "CL/2026/44",
    cargoType: "FCL", commodity: "Chemicals (Non-Haz)", containerType: "20ft GP", containers: 6, weightTons: 44,
    shippingLine: "MSC", vessel: "MSC Ingrid", voyage: "MSC-33W",
    port: "Port of Fujairah", terminal: "Fujairah Terminal",
    pickup: "Port of Fujairah", delivery: "JLT Warehouse, Dubai",
    rate: 9200, currency: "AED", taxPct: 5, terms: "Multi-drop",
    priority: "Normal", startDate: d(-10), endDate: d(-5),
    primaryVendorId: "s5", assignedDriverId: "dr3",
    status: "Driver Assigned",
    ops: opsFor("Driver Assigned"),
    woTimeline: [
      { id: "tl3_1", stage: "Approved", at: d(-11), by: "Rashid Khan" },
      { id: "tl3_2", stage: "Operations Started", at: d(-10), by: "Rashid Khan" },
      { id: "tl3_3", stage: "Driver Assigned", at: d(-9), by: "Omar Bin Sulayem" },
    ],
    woExpenses: [],
    payments: [],
    activityLog: [
      { id: "a6", at: d(-12), by: "Fatima Al Zaabi", action: "WO created" },
      { id: "a7", at: d(-11), by: "Rashid Khan", action: "Approved" },
      { id: "a8", at: d(-9), by: "Omar Bin Sulayem", action: "Driver assigned" },
    ],
    approvalHistory: [
      { id: "ap5", at: d(-12), by: "Fatima Al Zaabi", decision: "Submitted" },
      { id: "ap6", at: d(-11), by: "Rashid Khan", decision: "Approved" },
    ],
    createdAt: d(-12), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w4", woNumber: "WO-2026-0004", customerId: "c5", customerRef: "SS/SHJ/778",
    cargoType: "FCL", commodity: "Electronics", containerType: "40ft HC", containers: 3, weightTons: 18,
    shippingLine: "ONE", vessel: "ONE Aquila", voyage: "ONE-04E",
    port: "Port of Sharjah (Khor Fakkan)", terminal: "KF",
    pickup: "Khor Fakkan Port", delivery: "Hamriyah FZ, Sharjah",
    rate: 7400, currency: "AED", taxPct: 5, terms: "Insurance included",
    priority: "High", startDate: d(-5), endDate: d(2),
    status: "Submitted",
    activityLog: [{ id: "a9", at: d(-6), by: "Fatima Al Zaabi", action: "WO created & submitted" }],
    approvalHistory: [{ id: "ap7", at: d(-6), by: "Fatima Al Zaabi", decision: "Submitted" }],
    createdAt: d(-6), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w5", woNumber: "WO-2026-0005", customerId: "c1", customerRef: "GB/IMP/2026/152",
    cargoType: "LCL", commodity: "Garments", containerType: "20ft GP", containers: 1, weightTons: 8,
    shippingLine: "Hapag-Lloyd", port: "Jebel Ali Port",
    pickup: "Jebel Ali Port", delivery: "Al Quoz Warehouse",
    rate: 4500, currency: "AED", taxPct: 5, terms: "Priority delivery",
    priority: "Urgent", startDate: d(3), endDate: d(6),
    status: "Draft",
    activityLog: [{ id: "a10", at: d(-1), by: "Fatima Al Zaabi", action: "Draft created" }],
    createdAt: d(-1), createdBy: "Fatima Al Zaabi",
  },
];

export const seedShipments: Shipment[] = [
  { id: "sh1", shipmentNo: "SH-2026-0001", workOrderId: "w1", customerId: "c1", driverId: "dr1", truckId: "t1", pickup: "Jebel Ali Port, Dubai", delivery: "Al Quoz Warehouse", containers: 4, amount: 34000, stage: "Delivered", timeline: makeTimeline(8), docs: [], createdAt: d(-30), deliveredAt: d(-14) },
];

export const seedExpenses: Expense[] = [
  { id: "e1", date: d(-28), category: "Port Charges", amount: 1850, shipmentId: "sh1", vendor: "PortEdge Services LLC", status: "Approved" },
  { id: "e2", date: d(-26), category: "Toll Charges", amount: 320, shipmentId: "sh1", status: "Approved" },
  { id: "e3", date: d(-25), category: "Driver Expenses", amount: 450, shipmentId: "sh1", notes: "Food & lodging", status: "Approved" },
  { id: "e4", date: d(-19), category: "X-Ray Fees", amount: 650, vendor: "SafeInspect FZ", status: "Approved" },
  { id: "e5", date: d(-3), category: "Parking Charges", amount: 120, status: "Pending" },
  { id: "e6", date: d(-2), category: "Miscellaneous", amount: 280, notes: "Documentation fees", status: "Pending" },
];

export const seedPurchases: Purchase[] = [
  { id: "p1", poNumber: "PO-0001", supplierId: "s2", date: d(-30), amount: 14500, items: "Diesel 2500L", status: "Paid", paidAmount: 14500 },
  { id: "p2", poNumber: "PO-0002", supplierId: "s1", date: d(-15), amount: 7800, items: "Port handling — Feb batch", status: "Approved", paidAmount: 0 },
  { id: "p3", poNumber: "PO-0003", supplierId: "s3", date: d(-3), amount: 3200, items: "X-Ray & inspection lot", status: "Pending Approval", paidAmount: 0 },
];

export const seedInvoices: Invoice[] = [
  { id: "inv1", invoiceNo: "INV-2026-0001", customerId: "c1", shipmentId: "sh1", date: d(-14), dueDate: d(16), subtotal: 34000, taxPct: 5, total: 35700, paid: 35700, status: "Paid" },
  { id: "inv2", invoiceNo: "INV-2026-0002", customerId: "c2", date: d(-10), dueDate: d(20), subtotal: 12400, taxPct: 5, total: 13020, paid: 5000, status: "Partial" },
  { id: "inv3", invoiceNo: "INV-2026-0003", customerId: "c1", date: d(-50), dueDate: d(-20), subtotal: 9000, taxPct: 5, total: 9450, paid: 0, status: "Overdue" },
];

export const seedReceipts: Receipt[] = [
  { id: "r1", receiptNo: "RCP-0001", invoiceId: "inv1", customerId: "c1", date: d(-2), amount: 35700, mode: "Bank Transfer", reference: "NEFT-88123" },
  { id: "r2", receiptNo: "RCP-0002", invoiceId: "inv2", customerId: "c2", date: d(-1), amount: 5000, mode: "UPI", reference: "UPI-45671" },
];

export const seedJournal: JournalEntry[] = [
  { id: "j1", date: d(-14), type: "Journal", debitAccount: "Accounts Receivable", creditAccount: "Freight Income", amount: 34000, narration: "Invoice INV-2026-0001 raised" },
  { id: "j2", date: d(-2), type: "Contra", debitAccount: "Bank — Emirates NBD", creditAccount: "Cash in Hand", amount: 5000, narration: "Cash deposit" },
];
