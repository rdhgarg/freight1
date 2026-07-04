import type {
  Customer,
  Driver,
  Supplier,
  Truck,
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

export const seedTrucks: Truck[] = [
  { id: "t1", number: "MH 04 AB 1234", capacityTons: 20, driverId: "dr1", insuranceExpiry: d(180), fitnessExpiry: d(360), status: "Active" },
  { id: "t2", number: "DL 01 CD 5678", capacityTons: 16, driverId: "dr2", insuranceExpiry: d(90), fitnessExpiry: d(200), status: "Active" },
  { id: "t3", number: "PB 10 EF 9012", capacityTons: 25, driverId: "dr3", insuranceExpiry: d(45), fitnessExpiry: d(150), status: "Active" },
  { id: "t4", number: "TS 09 GH 3456", capacityTons: 18, driverId: "dr5", insuranceExpiry: d(-10), fitnessExpiry: d(60), status: "Active" },
  { id: "t5", number: "GJ 01 IJ 7890", capacityTons: 22, insuranceExpiry: d(300), fitnessExpiry: d(400), status: "Maintenance" },
];

export const seedSuppliers: Supplier[] = [
  { id: "s1", name: "PortEdge Services", gst: "27AAACP1010K1Z8", category: "Port Handling", services: "Customs, Handling, Storage", address: "JNPT, Navi Mumbai 400707", contactName: "Girish Patel", contactPhone: "+91 99000 10001", contactEmail: "ops@portedge.in", paymentTerms: "Net 15", createdAt: d(-250) },
  { id: "s2", name: "FuelMart India", gst: "07AABCF2020L1Z2", category: "Fuel", services: "Diesel, Lubricants", address: "NH-8, Gurugram 122001", contactName: "Nitin Sharma", contactPhone: "+91 99000 20002", contactEmail: "sales@fuelmart.in", paymentTerms: "Net 7", createdAt: d(-180) },
  { id: "s3", name: "SafeInspect Ltd", gst: "24AAECS3030M1Z6", category: "Inspection", services: "Container inspection, X-Ray", address: "Mundra, Kutch 370421", contactName: "Rita Joshi", contactPhone: "+91 99000 30003", contactEmail: "info@safeinspect.co", paymentTerms: "Net 30", createdAt: d(-140) },
];

const makeTimeline = (upto: number) =>
  SHIPMENT_STAGES.slice(0, upto).map((s, i) => ({
    id: `tl_${i}_${s}`,
    stage: s,
    at: d(-30 + i * 2),
    note: `${s} completed`,
    by: "Ops team",
  }));

export const seedWorkOrders: WorkOrder[] = [
  { id: "w1", woNumber: "WO-2026-0001", customerId: "c1", containers: 4, rate: 85000, pickup: "JNPT Port, Mumbai", delivery: "Bhiwandi Warehouse, MH", terms: "Door delivery, unloading included", startDate: d(-30), endDate: d(-25), status: "Converted", shipmentId: "sh1", createdAt: d(-32) },
  { id: "w2", woNumber: "WO-2026-0002", customerId: "c2", containers: 2, rate: 62000, pickup: "ICD Tughlakabad, Delhi", delivery: "Manesar Plant, HR", terms: "Standard 24hr free time", startDate: d(-20), endDate: d(-18), status: "Converted", shipmentId: "sh2", createdAt: d(-22) },
  { id: "w3", woNumber: "WO-2026-0003", customerId: "c3", containers: 6, rate: 92000, pickup: "Kandla Port", delivery: "Ahmedabad SEZ", terms: "Multi-drop", startDate: d(-10), endDate: d(-5), status: "Approved", createdAt: d(-12) },
  { id: "w4", woNumber: "WO-2026-0004", customerId: "c5", containers: 3, rate: 74000, pickup: "Krishnapatnam Port", delivery: "Hyderabad ICD", terms: "Insurance included", startDate: d(-5), endDate: d(2), status: "Pending Approval", createdAt: d(-6) },
  { id: "w5", woNumber: "WO-2026-0005", customerId: "c1", containers: 1, rate: 45000, pickup: "Nhava Sheva", delivery: "Pune Chakan", terms: "Priority delivery", startDate: d(3), endDate: d(6), status: "Draft", createdAt: d(-1) },
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
