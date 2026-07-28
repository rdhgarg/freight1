import type {
  Customer,
  Driver,
  Vendor,
  Fleet,
  WorkOrder,
  Shipment,
  Expense,
  Purchase,
  Invoice,
  Receipt,
  JournalEntry,
  User,
} from "./types";
import { SHIPMENT_STAGES } from "./types";

const d = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString();

export const seedUsers: User[] = [
  { id: "u1", name: "Aarav Sharma", email: "admin@hams.co", role: "Super Admin", active: true, password: "admin123", phone: "+91 98100 00001" },
  { id: "u2", name: "Priya Menon", email: "sales@hams.co", role: "Sales Manager", active: true, password: "demo1234", phone: "+91 98100 00002" },
  { id: "u3", name: "Rohit Verma", email: "ops@hams.co", role: "Operations Manager", active: true, password: "demo1234", phone: "+91 98100 00003" },
  { id: "u4", name: "Kavya Iyer", email: "accounts@hams.co", role: "Accounts Manager", active: true, password: "demo1234", phone: "+91 98100 00004" },
  { id: "u5", name: "Manish Rao", email: "drivers@hams.co", role: "Driver Manager", active: true, password: "demo1234", phone: "+91 98100 00005" },
  { id: "u6", name: "Neha Kapoor", email: "support@hams.co", role: "Customer Support", active: true, password: "demo1234", phone: "+91 98100 00006" },
  { id: "u7", name: "Read Only", email: "viewer@hams.co", role: "Viewer", active: true, password: "demo1234" },
];

export const seedCustomers: Customer[] = [
  { id: "c1", name: "Rakesh Malhotra", company: "Bluewave Exports Pvt Ltd", gst: "27AABCB1234C1Z5", email: "ops@bluewave.in", phone: "+91 98200 12345", address: "Andheri East, Mumbai, MH 400069", paymentTerms: "Net 30", creditLimit: 2500000, status: "Active", createdAt: d(-120) },
  { id: "c2", name: "Sanjay Gupta", company: "Meridian Traders LLP", gst: "07AAECM4567D1Z2", email: "accounts@meridian.co.in", phone: "+91 98201 23456", address: "Karol Bagh, New Delhi 110005", paymentTerms: "Net 45", creditLimit: 1500000, status: "Active", createdAt: d(-90) },
  { id: "c3", name: "Fatima Sheikh", company: "Crescent Logistics", gst: "24AACCC7890E1Z1", email: "hello@crescent.in", phone: "+91 98202 34567", address: "Kandla Port Rd, Gandhidham 370201", paymentTerms: "Net 15", creditLimit: 800000, status: "Active", createdAt: d(-60) },
  { id: "c4", name: "Vikram Singh", company: "Northline Freight", gst: "03AAFCN2345F1Z9", email: "vikram@northline.in", phone: "+91 98203 45678", address: "Ludhiana, Punjab 141001", paymentTerms: "Net 30", creditLimit: 1200000, status: "Inactive", createdAt: d(-200) },
  { id: "c5", name: "Anitha Reddy", company: "Southstar Cargo", gst: "36AAECS8765G1Z3", email: "anitha@southstar.co", phone: "+91 98204 56789", address: "Hitech City, Hyderabad 500081", paymentTerms: "Net 30", creditLimit: 1800000, status: "Active", createdAt: d(-45) },
];

export const seedDrivers: Driver[] = [
  { id: "dr1", name: "Ramesh Yadav", mobile: "+91 90000 11111", license: "MH14 20200001234", truckId: "t1", status: "On Trip", joinedAt: d(-300) },
  { id: "dr2", name: "Sohan Lal", mobile: "+91 90000 22222", license: "DL07 20210004567", truckId: "t2", status: "Available", joinedAt: d(-200) },
  { id: "dr3", name: "Balbir Singh", mobile: "+91 90000 33333", license: "PB10 20190008901", truckId: "t3", status: "Available", joinedAt: d(-500) },
  { id: "dr4", name: "Suresh Kumar", mobile: "+91 90000 44444", license: "GJ01 20220002345", status: "Off Duty", joinedAt: d(-100) },
  { id: "dr5", name: "Iqbal Khan", mobile: "+91 90000 55555", license: "TS09 20200006789", truckId: "t4", status: "On Trip", joinedAt: d(-400) },
];

export const seedFleet: Fleet[] = [
  { id: "t1", registration: "MH 04 AB 1234", vehicleType: "Trailer 40ft", capacityTons: 25, ownership: "Owned", driverId: "dr1", insuranceExpiry: d(180), fitnessExpiry: d(360), permitExpiry: d(210), pucExpiry: d(60), odometerKm: 154000, status: "Assigned", createdAt: d(-720) },
  { id: "t2", registration: "DL 01 CD 5678", vehicleType: "Container Truck", capacityTons: 16, ownership: "Owned", driverId: "dr2", insuranceExpiry: d(90), fitnessExpiry: d(200), permitExpiry: d(150), pucExpiry: d(30), odometerKm: 98000, status: "Available", createdAt: d(-500) },
  { id: "t3", registration: "PB 10 EF 9012", vehicleType: "Trailer 20ft", capacityTons: 22, ownership: "Attached", ownerName: "Balwant Transports", driverId: "dr3", insuranceExpiry: d(45), fitnessExpiry: d(150), permitExpiry: d(90), pucExpiry: d(15), odometerKm: 220000, status: "Available", createdAt: d(-900) },
  { id: "t4", registration: "TS 09 GH 3456", vehicleType: "Container Truck", capacityTons: 18, ownership: "Owned", driverId: "dr5", insuranceExpiry: d(-10), fitnessExpiry: d(60), permitExpiry: d(-5), pucExpiry: d(-2), odometerKm: 176000, status: "Assigned", createdAt: d(-600) },
  { id: "t5", registration: "GJ 01 IJ 7890", vehicleType: "Tanker", capacityTons: 22, ownership: "Market Hire", ownerName: "Prime Logistics", insuranceExpiry: d(300), fitnessExpiry: d(400), permitExpiry: d(300), pucExpiry: d(120), odometerKm: 44000, status: "Maintenance", createdAt: d(-200) },
  { id: "t6", registration: "TN 22 KL 4455", vehicleType: "Trailer 40ft", capacityTons: 28, ownership: "Owned", insuranceExpiry: d(220), fitnessExpiry: d(320), permitExpiry: d(180), pucExpiry: d(80), odometerKm: 12000, status: "Available", createdAt: d(-60) },
];
export const seedTrucks = seedFleet;

export const seedVendors: Vendor[] = [
  { id: "s1", name: "PortEdge Services", code: "V-0001", category: "Port Handling", gst: "27AAACP1010K1Z8", services: "Customs, Handling, Storage", address: "JNPT, Navi Mumbai 400707", contactName: "Girish Patel", contactPhone: "+91 99000 10001", contactEmail: "ops@portedge.in", paymentTerms: "Net 15", rating: 4.5, status: "Active", createdAt: d(-250) },
  { id: "s2", name: "FuelMart India", code: "V-0002", category: "Fuel", gst: "07AABCF2020L1Z2", services: "Diesel, Lubricants", address: "NH-8, Gurugram 122001", contactName: "Nitin Sharma", contactPhone: "+91 99000 20002", contactEmail: "sales@fuelmart.in", paymentTerms: "Net 7", rating: 4.2, status: "Active", createdAt: d(-180) },
  { id: "s3", name: "SafeInspect Ltd", code: "V-0003", category: "Inspection", gst: "24AAECS3030M1Z6", services: "Container inspection, X-Ray", address: "Mundra, Kutch 370421", contactName: "Rita Joshi", contactPhone: "+91 99000 30003", contactEmail: "info@safeinspect.co", paymentTerms: "Net 30", rating: 4.0, status: "Active", createdAt: d(-140) },
  { id: "s4", name: "Trans Global CHA", code: "V-0004", category: "Customs", gst: "27AABCT4040N1Z4", services: "Customs clearance, Documentation", address: "Nhava Sheva, Navi Mumbai", contactName: "Anil Deshmukh", contactPhone: "+91 99000 40004", contactEmail: "ops@transglobal.in", paymentTerms: "Net 30", rating: 4.6, status: "Active", createdAt: d(-320) },
  { id: "s5", name: "SpeedRoad Carriers", code: "V-0005", category: "Transport", gst: "24AAFSR5050P1Z0", services: "Trailer & container transport", address: "Ahmedabad, GJ 380001", contactName: "Kishan Patel", contactPhone: "+91 99000 50005", contactEmail: "ops@speedroad.in", paymentTerms: "Net 15", rating: 4.3, status: "Active", createdAt: d(-410) },
  { id: "s6", name: "OceanBridge Forwarders", code: "V-0006", category: "Forwarder", gst: "07AAECO6060Q1Z8", services: "Sea freight forwarding", address: "Nehru Place, Delhi", contactName: "Meera Nair", contactPhone: "+91 99000 60006", contactEmail: "hello@oceanbridge.co", paymentTerms: "Net 45", rating: 4.4, status: "Active", createdAt: d(-500) },
  { id: "s7", name: "Cargo Depot Warehousing", code: "V-0007", category: "Warehouse", gst: "36AAACC7070R1Z2", services: "Bonded warehouse, storage", address: "Hitech City, Hyderabad", contactName: "Suresh Rao", contactPhone: "+91 99000 70007", contactEmail: "ops@cargodepot.in", paymentTerms: "Net 30", rating: 3.9, status: "Active", createdAt: d(-150) },
];
export const seedSuppliers = seedVendors;

const makeTimeline = (upto: number) =>
  SHIPMENT_STAGES.slice(0, upto).map((s, i) => ({
    id: `tl_${i}_${s}`,
    stage: s,
    at: d(-30 + i * 2),
    note: `${s} completed`,
    by: "Ops team",
  }));

export const seedWorkOrders: WorkOrder[] = [
  {
    id: "w1", woNumber: "WO-2026-0001", customerId: "c1", customerRef: "BW/EXP/2026/145",
    cargoType: "FCL", commodity: "Textiles", containerType: "40ft HC", containers: 4, weightTons: 22, volumeCbm: 60,
    shippingLine: "Maersk", vessel: "MV Maersk Halifax", voyage: "MH-224E", blNumber: "MAEU2245678", deliveryOrderNo: "DO-88123",
    port: "JNPT (Nhava Sheva)", terminal: "BMCT",
    pickup: "JNPT Port, Mumbai", delivery: "Bhiwandi Warehouse, MH",
    deliveryContactName: "Ramesh (Bluewave WH)", deliveryContactPhone: "+91 98300 11122",
    rate: 85000, currency: "INR", taxPct: 18, billingTerms: "Net 30", terms: "Door delivery, unloading included",
    priority: "High", startDate: d(-30), endDate: d(-25), requiredDeliveryDate: d(-24),
    primaryVendorId: "s5",
    status: "Trip Created", shipmentId: "sh1",
    activityLog: [{ id: "a1", at: d(-32), by: "Priya Menon", action: "WO created" }, { id: "a2", at: d(-31), by: "Rohit Verma", action: "Approved" }, { id: "a3", at: d(-30), by: "System", action: "Trip created" }],
    approvalHistory: [{ id: "ap1", at: d(-32), by: "Priya Menon", decision: "Submitted" }, { id: "ap2", at: d(-31), by: "Rohit Verma", decision: "Approved", note: "Approved with priority" }],
    createdAt: d(-32), createdBy: "Priya Menon",
  },
  {
    id: "w2", woNumber: "WO-2026-0002", customerId: "c2", customerRef: "MT/DEL/998",
    cargoType: "FCL", commodity: "Auto Parts", containerType: "20ft GP", containers: 2, weightTons: 12,
    shippingLine: "CMA CGM", vessel: "CMA CGM Louvre", voyage: "CGM-11N", blNumber: "CMDU9987654",
    port: "ICD Tughlakabad", terminal: "TKD",
    pickup: "ICD Tughlakabad, Delhi", delivery: "Manesar Plant, HR",
    rate: 62000, currency: "INR", taxPct: 18, terms: "Standard 24hr free time",
    priority: "Normal", startDate: d(-20), endDate: d(-18),
    primaryVendorId: "s4",
    status: "Trip Created", shipmentId: "sh2",
    activityLog: [{ id: "a4", at: d(-22), by: "Priya Menon", action: "WO created" }],
    approvalHistory: [{ id: "ap3", at: d(-22), by: "Priya Menon", decision: "Submitted" }, { id: "ap4", at: d(-21), by: "Rohit Verma", decision: "Approved" }],
    createdAt: d(-22), createdBy: "Priya Menon",
  },
  {
    id: "w3", woNumber: "WO-2026-0003", customerId: "c3", customerRef: "CL/2026/44",
    cargoType: "FCL", commodity: "Chemicals (Non-Haz)", containerType: "20ft GP", containers: 6, weightTons: 44,
    shippingLine: "MSC", vessel: "MSC Ingrid", voyage: "MSC-33W",
    port: "Kandla", terminal: "Kandla Cargo",
    pickup: "Kandla Port", delivery: "Ahmedabad SEZ",
    rate: 92000, currency: "INR", taxPct: 18, terms: "Multi-drop",
    priority: "Normal", startDate: d(-10), endDate: d(-5),
    primaryVendorId: "s5",
    status: "Ready for Operations",
    activityLog: [{ id: "a5", at: d(-12), by: "Priya Menon", action: "WO created" }, { id: "a6", at: d(-11), by: "Rohit Verma", action: "Approved" }],
    approvalHistory: [{ id: "ap5", at: d(-12), by: "Priya Menon", decision: "Submitted" }, { id: "ap6", at: d(-11), by: "Rohit Verma", decision: "Approved" }],
    createdAt: d(-12), createdBy: "Priya Menon",
  },
  {
    id: "w4", woNumber: "WO-2026-0004", customerId: "c5", customerRef: "SS/HYD/778",
    cargoType: "FCL", commodity: "Electronics", containerType: "40ft HC", containers: 3, weightTons: 18,
    shippingLine: "ONE", vessel: "ONE Aquila", voyage: "ONE-04E",
    port: "Krishnapatnam", terminal: "KPCT",
    pickup: "Krishnapatnam Port", delivery: "Hyderabad ICD",
    rate: 74000, currency: "INR", taxPct: 18, terms: "Insurance included",
    priority: "High", startDate: d(-5), endDate: d(2),
    status: "Submitted",
    activityLog: [{ id: "a7", at: d(-6), by: "Priya Menon", action: "WO created & submitted" }],
    approvalHistory: [{ id: "ap7", at: d(-6), by: "Priya Menon", decision: "Submitted" }],
    createdAt: d(-6), createdBy: "Priya Menon",
  },
  {
    id: "w5", woNumber: "WO-2026-0005", customerId: "c1", customerRef: "BW/EXP/2026/152",
    cargoType: "LCL", commodity: "Garments", containerType: "20ft GP", containers: 1, weightTons: 8,
    shippingLine: "Hapag-Lloyd", port: "JNPT (Nhava Sheva)",
    pickup: "Nhava Sheva", delivery: "Pune Chakan",
    rate: 45000, currency: "INR", taxPct: 18, terms: "Priority delivery",
    priority: "Urgent", startDate: d(3), endDate: d(6),
    status: "Draft",
    activityLog: [{ id: "a8", at: d(-1), by: "Priya Menon", action: "Draft created" }],
    createdAt: d(-1), createdBy: "Priya Menon",
  },
];

export const seedShipments: Shipment[] = [
  { id: "sh1", shipmentNo: "SH-2026-0001", workOrderId: "w1", customerId: "c1", driverId: "dr1", truckId: "t1", pickup: "JNPT Port, Mumbai", delivery: "Bhiwandi Warehouse", containers: 4, amount: 340000, stage: "Delivered", timeline: makeTimeline(8), docs: [], createdAt: d(-30), deliveredAt: d(-14) },
  { id: "sh2", shipmentNo: "SH-2026-0002", workOrderId: "w2", customerId: "c2", driverId: "dr5", truckId: "t4", pickup: "ICD Tughlakabad", delivery: "Manesar Plant", containers: 2, amount: 124000, stage: "In Transit", timeline: makeTimeline(7), docs: [], createdAt: d(-20) },
  { id: "sh3", shipmentNo: "SH-2026-0003", workOrderId: "w1", customerId: "c1", driverId: "dr3", pickup: "JNPT Port", delivery: "Nashik DC", containers: 3, amount: 210000, stage: "Port Activity", timeline: makeTimeline(3), docs: [], createdAt: d(-4) },
];

export const seedExpenses: Expense[] = [
  { id: "e1", date: d(-28), category: "Port Charges", amount: 18500, shipmentId: "sh1", vendor: "PortEdge Services", status: "Approved" },
  { id: "e2", date: d(-26), category: "Toll Charges", amount: 3200, shipmentId: "sh1", status: "Approved" },
  { id: "e3", date: d(-25), category: "Driver Expenses", amount: 4500, shipmentId: "sh1", notes: "Food & lodging", status: "Approved" },
  { id: "e4", date: d(-19), category: "X-Ray Fees", amount: 6500, shipmentId: "sh2", vendor: "SafeInspect Ltd", status: "Approved" },
  { id: "e5", date: d(-3), category: "Parking Charges", amount: 1200, shipmentId: "sh3", status: "Pending" },
  { id: "e6", date: d(-2), category: "Miscellaneous", amount: 2800, notes: "Documentation fees", status: "Pending" },
];

export const seedPurchases: Purchase[] = [
  { id: "p1", poNumber: "PO-0001", supplierId: "s2", date: d(-30), amount: 145000, items: "Diesel 2500L", status: "Paid", paidAmount: 145000 },
  { id: "p2", poNumber: "PO-0002", supplierId: "s1", date: d(-15), amount: 78000, items: "Port handling — Feb batch", status: "Approved", paidAmount: 0 },
  { id: "p3", poNumber: "PO-0003", supplierId: "s3", date: d(-3), amount: 32000, items: "X-Ray & inspection lot", status: "Pending Approval", paidAmount: 0 },
];

export const seedInvoices: Invoice[] = [
  { id: "inv1", invoiceNo: "INV-2026-0001", customerId: "c1", shipmentId: "sh1", date: d(-14), dueDate: d(16), subtotal: 340000, taxPct: 18, total: 401200, paid: 401200, status: "Paid" },
  { id: "inv2", invoiceNo: "INV-2026-0002", customerId: "c2", shipmentId: "sh2", date: d(-10), dueDate: d(20), subtotal: 124000, taxPct: 18, total: 146320, paid: 50000, status: "Partial" },
  { id: "inv3", invoiceNo: "INV-2026-0003", customerId: "c1", date: d(-50), dueDate: d(-20), subtotal: 90000, taxPct: 18, total: 106200, paid: 0, status: "Overdue" },
];

export const seedReceipts: Receipt[] = [
  { id: "r1", receiptNo: "RCP-0001", invoiceId: "inv1", customerId: "c1", date: d(-2), amount: 401200, mode: "Bank Transfer", reference: "NEFT-88123" },
  { id: "r2", receiptNo: "RCP-0002", invoiceId: "inv2", customerId: "c2", date: d(-1), amount: 50000, mode: "UPI", reference: "UPI-45671" },
];

export const seedJournal: JournalEntry[] = [
  { id: "j1", date: d(-14), type: "Journal", debitAccount: "Accounts Receivable", creditAccount: "Freight Income", amount: 340000, narration: "Invoice INV-2026-0001 raised" },
  { id: "j2", date: d(-2), type: "Contra", debitAccount: "Bank — HDFC", creditAccount: "Cash in Hand", amount: 50000, narration: "Cash deposit" },
];
