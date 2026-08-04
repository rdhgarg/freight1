import type {
  Customer, Driver, Vendor, Fleet, WorkOrder, Shipment, Expense, Purchase, Invoice, Receipt, JournalEntry, User,
  WOOpsTask, WorkOrderStatus,
} from "./types";
import { SHIPMENT_STAGES, WO_LIFECYCLE, WO_OPS_TASKS } from "./types";

const d = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString();

/** Ops checklist auto-filled up to the WO's current stage. */
const tasksFor = (status: WorkOrderStatus, by = "Rashid Khan"): WOOpsTask[] => {
  const idx = WO_LIFECYCLE.indexOf(status);
  return WO_OPS_TASKS.map((t, i) => {
    const done = idx >= WO_LIFECYCLE.indexOf(t.stage as WorkOrderStatus);
    return {
      key: t.key,
      completed: done,
      completedAt: done ? d(-20 + i) : undefined,
      by: done ? by : undefined,
      department: done ? ("Operations" as const) : undefined,
    };
  });
};

const timelineTo = (status: WorkOrderStatus, prefix: string, startOffset = -20): WorkOrder["woTimeline"] => {
  const idx = WO_LIFECYCLE.indexOf(status);
  return WO_LIFECYCLE.slice(0, idx + 1).map((stage, i) => ({
    id: `${prefix}_tl_${i}`,
    stage,
    at: d(startOffset + i),
    by: i < 2 ? "Fatima Al Zaabi" : i < 12 ? "Rashid Khan" : "Layla Hassan",
    department: i < 2 ? ("Sales" as const) : i < 12 ? ("Operations" as const) : ("Accounts" as const),
    note: `${stage} recorded`,
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
  { id: "dr1", name: "Iqbal Rahman", employeeId: "EMP-1001", mobile: "+971 55 900 1111", license: "DXB-DL-2020-1234", licenseExpiry: d(240), nationality: "Bangladeshi", truckId: "t1", emergencyContactName: "Shabnam Rahman", emergencyContactPhone: "+971 55 700 1111", status: "On Trip", joinedAt: d(-300) },
  { id: "dr2", name: "Suresh Kumar", employeeId: "EMP-1002", mobile: "+971 55 900 2222", license: "DXB-DL-2021-4567", licenseExpiry: d(90), nationality: "Indian", truckId: "t2", emergencyContactName: "Lakshmi Kumar", emergencyContactPhone: "+971 55 700 2222", status: "Available", joinedAt: d(-200) },
  { id: "dr3", name: "Mohammed Aslam", employeeId: "EMP-1003", mobile: "+971 55 900 3333", license: "AUH-DL-2019-8901", licenseExpiry: d(25), nationality: "Pakistani", truckId: "t3", emergencyContactName: "Yasmin Aslam", emergencyContactPhone: "+971 55 700 3333", status: "Assigned", joinedAt: d(-500) },
  { id: "dr4", name: "Ravi Pillai", employeeId: "EMP-1004", mobile: "+971 55 900 4444", license: "SHJ-DL-2022-2345", licenseExpiry: d(400), nationality: "Indian", emergencyContactName: "Anita Pillai", emergencyContactPhone: "+971 55 700 4444", status: "Leave", joinedAt: d(-100) },
  { id: "dr5", name: "Bilal Ahmed", employeeId: "EMP-1005", mobile: "+971 55 900 5555", license: "DXB-DL-2020-6789", licenseExpiry: d(150), nationality: "Pakistani", truckId: "t4", emergencyContactName: "Sana Ahmed", emergencyContactPhone: "+971 55 700 5555", status: "On Trip", joinedAt: d(-400) },
  { id: "dr6", name: "Joseph Mathew", employeeId: "EMP-1006", mobile: "+971 55 900 6666", license: "AJM-DL-2023-1122", licenseExpiry: d(560), nationality: "Indian", emergencyContactName: "Mary Mathew", emergencyContactPhone: "+971 55 700 6666", status: "Available", joinedAt: d(-70) },
  { id: "dr7", name: "Abdulla Al Nuaimi", employeeId: "EMP-1007", mobile: "+971 55 900 7777", license: "AUH-DL-2018-3344", licenseExpiry: d(-15), nationality: "Emirati", emergencyContactName: "Hessa Al Nuaimi", emergencyContactPhone: "+971 55 700 7777", status: "Inactive", joinedAt: d(-800) },
];

export const seedFleet: Fleet[] = [
  { id: "t1", registration: "DXB A 12345", vehicleType: "Trailer 40ft", capacityTons: 25, ownership: "Owned", driverId: "dr1", insuranceExpiry: d(180), fitnessExpiry: d(360), permitExpiry: d(210), pucExpiry: d(60), odometerKm: 154000, status: "Assigned", createdAt: d(-720) },
  { id: "t2", registration: "DXB B 56789", vehicleType: "Container Truck", capacityTons: 16, ownership: "Owned", driverId: "dr2", insuranceExpiry: d(90), fitnessExpiry: d(200), permitExpiry: d(150), pucExpiry: d(30), odometerKm: 98000, status: "Available", createdAt: d(-500) },
  { id: "t3", registration: "AUH C 90123", vehicleType: "Trailer 20ft", capacityTons: 22, ownership: "Attached", ownerName: "Al Barsha Transport", driverId: "dr3", insuranceExpiry: d(45), fitnessExpiry: d(150), permitExpiry: d(90), pucExpiry: d(15), odometerKm: 220000, status: "Assigned", createdAt: d(-900) },
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
    primaryVendorId: "s5", assignedDriverId: "dr1", assignedFleetId: "t1", eta: d(-25),
    status: "Payment Received",
    opsTasks: tasksFor("Payment Received"),
    opsRemarks: "Cleared without inspection hold.",
    woTimeline: timelineTo("Payment Received", "w1", -30),
    assignmentHistory: [
      { id: "ah1", at: d(-28), type: "Driver", driverId: "dr1", action: "Assigned", by: "Omar Bin Sulayem" },
      { id: "ah2", at: d(-28), type: "Fleet", fleetId: "t1", driverId: "dr1", action: "Assigned", by: "Omar Bin Sulayem" },
    ],
    docs: [
      { id: "wd1", name: "Delivery-Order-88123.pdf", type: "application/pdf", category: "Delivery Order", uploadedAt: d(-29), uploadedBy: "Rashid Khan" },
      { id: "wd2", name: "Gate-Pass-JA-4471.pdf", type: "application/pdf", category: "Gate Pass", uploadedAt: d(-27), uploadedBy: "Rashid Khan" },
      { id: "wd3", name: "POD-Al-Quoz.jpg", type: "image/jpeg", category: "Proof Of Delivery", uploadedAt: d(-16), uploadedBy: "Iqbal Rahman" },
    ],
    woExpenses: [
      { id: "we1", date: d(-28), category: "Port Charges", amount: 1850, vatPct: 5, vendorId: "s1", vendor: "PortEdge Services LLC", status: "Approved", by: "Rashid Khan" },
      { id: "we2", date: d(-26), category: "Toll", amount: 320, vatPct: 5, status: "Approved", by: "Rashid Khan" },
      { id: "we3", date: d(-25), category: "Fuel", amount: 450, vatPct: 5, vendorId: "s2", vendor: "FuelMart UAE", notes: "Diesel top-up", status: "Approved", by: "Omar Bin Sulayem" },
    ],
    invoice: { invoiceNo: "INV-2026-0001", date: d(-14), dueDate: d(16), subtotal: 34000, vatPct: 5, vatAmount: 1700, total: 35700, status: "Paid", generatedBy: "Layla Hassan" },
    invoiceNo: "INV-2026-0001", invoiceGeneratedAt: d(-14),
    payments: [{ id: "wp1", date: d(-2), amount: 35700, mode: "Bank Transfer", reference: "NEFT-88123", receiptNo: "RCP-0001", by: "Layla Hassan" }],
    activityLog: [
      { id: "a1", at: d(-32), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" },
      { id: "a2", at: d(-28), by: "Omar Bin Sulayem", action: "Driver assigned", note: "Iqbal Rahman", department: "Fleet" },
      { id: "a3", at: d(-14), by: "Layla Hassan", action: "Invoice generated", note: "INV-2026-0001", department: "Accounts" },
      { id: "a4", at: d(-2), by: "Layla Hassan", action: "Payment received", note: "AED 35,700 · Bank Transfer", department: "Accounts" },
    ],
    createdAt: d(-32), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w2", woNumber: "WO-2026-0002", customerId: "c2", customerRef: "MT/JAF/998",
    cargoType: "FCL", commodity: "Auto Parts", containerType: "20ft GP", containers: 2, weightTons: 12,
    shippingLine: "CMA CGM", vessel: "CMA CGM Louvre", voyage: "CGM-11N", blNumber: "CMDU9987654", deliveryOrderNo: "DO-77450",
    port: "Khalifa Port (Abu Dhabi)", terminal: "KP2",
    pickup: "Khalifa Port, Abu Dhabi", delivery: "Mussafah Industrial, Abu Dhabi",
    rate: 6200, currency: "AED", taxPct: 5, terms: "Standard 24hr free time",
    priority: "Normal", startDate: d(-20), endDate: d(-18),
    primaryVendorId: "s4", assignedDriverId: "dr5", assignedFleetId: "t4", eta: d(-18),
    status: "Out From Port",
    opsTasks: tasksFor("Out From Port"),
    woTimeline: timelineTo("Out From Port", "w2", -20),
    assignmentHistory: [
      { id: "ah3", at: d(-19), type: "Driver", driverId: "dr5", action: "Assigned", by: "Omar Bin Sulayem" },
      { id: "ah4", at: d(-19), type: "Fleet", fleetId: "t4", driverId: "dr5", action: "Assigned", by: "Omar Bin Sulayem" },
    ],
    docs: [
      { id: "wd4", name: "DO-77450.pdf", type: "application/pdf", category: "Delivery Order", uploadedAt: d(-20), uploadedBy: "Rashid Khan" },
      { id: "wd5", name: "XRay-Report-KP2.pdf", type: "application/pdf", category: "X-Ray Report", uploadedAt: d(-19), uploadedBy: "Rashid Khan" },
    ],
    woExpenses: [
      { id: "we4", date: d(-19), category: "Port Charges", amount: 650, vatPct: 5, vendorId: "s3", vendor: "SafeInspect FZ", status: "Approved", by: "Rashid Khan" },
      { id: "we5", date: d(-18), category: "Parking", amount: 140, vatPct: 5, status: "Pending", by: "Bilal Ahmed" },
    ],
    payments: [],
    activityLog: [
      { id: "a5", at: d(-22), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" },
      { id: "a6", at: d(-19), by: "Rashid Khan", action: "X-Ray completed", department: "Operations" },
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
    primaryVendorId: "s5", assignedDriverId: "dr3", assignedFleetId: "t3", eta: d(-4),
    status: "Fleet Assigned",
    opsTasks: tasksFor("Fleet Assigned"),
    woTimeline: timelineTo("Fleet Assigned", "w3", -10),
    assignmentHistory: [
      { id: "ah5", at: d(-9), type: "Driver", driverId: "dr3", action: "Assigned", by: "Omar Bin Sulayem" },
      { id: "ah6", at: d(-8), type: "Fleet", fleetId: "t3", driverId: "dr3", action: "Assigned", by: "Omar Bin Sulayem" },
    ],
    docs: [{ id: "wd6", name: "DO-Fujairah-1121.pdf", type: "application/pdf", category: "Delivery Order", uploadedAt: d(-10), uploadedBy: "Rashid Khan" }],
    woExpenses: [{ id: "we6", date: d(-8), category: "Labour", amount: 900, vatPct: 5, status: "Pending", by: "Rashid Khan" }],
    payments: [],
    activityLog: [
      { id: "a7", at: d(-12), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" },
      { id: "a8", at: d(-9), by: "Omar Bin Sulayem", action: "Driver assigned", note: "Mohammed Aslam", department: "Fleet" },
      { id: "a9", at: d(-8), by: "Omar Bin Sulayem", action: "Fleet assigned", note: "AUH C 90123", department: "Fleet" },
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
    primaryVendorId: "s1",
    status: "Operations Started",
    opsTasks: tasksFor("Operations Started"),
    woTimeline: timelineTo("Operations Started", "w4", -5),
    docs: [],
    woExpenses: [],
    payments: [],
    activityLog: [{ id: "a10", at: d(-6), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" }],
    createdAt: d(-6), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w5", woNumber: "WO-2026-0005", customerId: "c1", customerRef: "GB/IMP/2026/152",
    cargoType: "LCL", commodity: "Garments", containerType: "20ft GP", containers: 1, weightTons: 8,
    shippingLine: "Hapag-Lloyd", port: "Jebel Ali Port", terminal: "T1",
    pickup: "Jebel Ali Port", delivery: "Al Quoz Warehouse",
    rate: 4500, currency: "AED", taxPct: 5, terms: "Priority delivery",
    priority: "Urgent", startDate: d(3), endDate: d(6),
    primaryVendorId: "s6",
    status: "Draft",
    opsTasks: tasksFor("Draft"),
    woTimeline: timelineTo("Draft", "w5", -1),
    docs: [],
    woExpenses: [],
    payments: [],
    activityLog: [{ id: "a11", at: d(-1), by: "Fatima Al Zaabi", action: "Draft created", department: "Sales" }],
    createdAt: d(-1), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w6", woNumber: "WO-2026-0006", customerId: "c2", customerRef: "MT/JAF/1004",
    cargoType: "Reefer", commodity: "Frozen Foods", containerType: "40ft Reefer", containers: 2, weightTons: 20,
    shippingLine: "Evergreen", vessel: "Ever Given", voyage: "EG-19E", blNumber: "EGLV5541230", deliveryOrderNo: "DO-90211",
    port: "Jebel Ali Port", terminal: "T2",
    pickup: "Jebel Ali Port", delivery: "Al Aweer Cold Store, Dubai",
    rate: 11500, currency: "AED", taxPct: 5, terms: "Temperature controlled -18°C",
    priority: "Urgent", startDate: d(-8), endDate: d(-3),
    primaryVendorId: "s5", assignedDriverId: "dr2", assignedFleetId: "t2", eta: d(-3),
    status: "Delivered",
    opsTasks: tasksFor("Delivered"),
    woTimeline: timelineTo("Delivered", "w6", -8),
    assignmentHistory: [
      { id: "ah7", at: d(-7), type: "Driver", driverId: "dr6", action: "Assigned", by: "Omar Bin Sulayem" },
      { id: "ah8", at: d(-6), type: "Driver", driverId: "dr2", action: "Replaced", by: "Omar Bin Sulayem", note: "Original driver on leave" },
      { id: "ah9", at: d(-6), type: "Fleet", fleetId: "t2", driverId: "dr2", action: "Assigned", by: "Omar Bin Sulayem" },
    ],
    docs: [
      { id: "wd7", name: "DO-90211.pdf", type: "application/pdf", category: "Delivery Order", uploadedAt: d(-8), uploadedBy: "Rashid Khan" },
      { id: "wd8", name: "POD-Aweer.jpg", type: "image/jpeg", category: "Proof Of Delivery", uploadedAt: d(-3), uploadedBy: "Suresh Kumar" },
    ],
    woExpenses: [
      { id: "we7", date: d(-7), category: "Port Charges", amount: 2100, vatPct: 5, vendorId: "s1", vendor: "PortEdge Services LLC", status: "Approved", by: "Rashid Khan" },
      { id: "we8", date: d(-5), category: "Fuel", amount: 780, vatPct: 5, vendorId: "s2", vendor: "FuelMart UAE", status: "Approved", by: "Suresh Kumar" },
    ],
    payments: [],
    activityLog: [
      { id: "a12", at: d(-9), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" },
      { id: "a13", at: d(-6), by: "Omar Bin Sulayem", action: "Driver replaced", note: "Joseph Mathew → Suresh Kumar", department: "Fleet" },
      { id: "a14", at: d(-3), by: "Rashid Khan", action: "Delivered", department: "Operations" },
    ],
    createdAt: d(-9), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w7", woNumber: "WO-2026-0007", customerId: "c3", customerRef: "CL/2026/51",
    cargoType: "FCL", commodity: "Marble Tiles", containerType: "40ft GP", containers: 5, weightTons: 38,
    shippingLine: "COSCO", vessel: "COSCO Pride", voyage: "CO-77W", blNumber: "COSU8812004",
    port: "Hamriyah Free Zone Port", terminal: "HFZ-1",
    pickup: "Hamriyah FZ Port, Sharjah", delivery: "Al Quoz Stone Yard, Dubai",
    rate: 8900, currency: "AED", taxPct: 5, terms: "Crane unloading by consignee",
    priority: "Normal", startDate: d(-15), endDate: d(-11),
    primaryVendorId: "s7", assignedDriverId: "dr1", assignedFleetId: "t1",
    status: "Ready For Billing",
    opsTasks: tasksFor("Ready For Billing"),
    woTimeline: timelineTo("Ready For Billing", "w7", -15),
    docs: [{ id: "wd9", name: "Port-Receipt-HFZ.pdf", type: "application/pdf", category: "Port Receipt", uploadedAt: d(-12), uploadedBy: "Rashid Khan" }],
    woExpenses: [{ id: "we9", date: d(-12), category: "Labour", amount: 1250, vatPct: 5, status: "Approved", by: "Rashid Khan" }],
    payments: [],
    activityLog: [
      { id: "a15", at: d(-16), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" },
      { id: "a16", at: d(-11), by: "Rashid Khan", action: "Marked ready for billing", department: "Operations" },
    ],
    createdAt: d(-16), createdBy: "Fatima Al Zaabi",
  },
  {
    id: "w8", woNumber: "WO-2026-0008", customerId: "c5", customerRef: "SS/AUH/312",
    cargoType: "Bulk", commodity: "Steel Coils", containerType: "Flat Rack", containers: 4, weightTons: 52,
    shippingLine: "Hapag-Lloyd", vessel: "Hapag Bremen", voyage: "HL-12E", blNumber: "HLCU4410023",
    port: "Mina Zayed", terminal: "MZ-3",
    pickup: "Mina Zayed, Abu Dhabi", delivery: "ICAD III, Abu Dhabi",
    rate: 10400, currency: "AED", taxPct: 5, billingTerms: "Net 30", terms: "Escort vehicle required",
    priority: "High", startDate: d(-25), endDate: d(-20),
    primaryVendorId: "s4", assignedDriverId: "dr5", assignedFleetId: "t4",
    status: "Payment Pending",
    opsTasks: tasksFor("Payment Pending"),
    woTimeline: timelineTo("Payment Pending", "w8", -25),
    docs: [
      { id: "wd10", name: "Invoice-INV-2026-0002.pdf", type: "application/pdf", category: "Invoice", uploadedAt: d(-9), uploadedBy: "Layla Hassan" },
      { id: "wd11", name: "Receipt-Part-Payment.pdf", type: "application/pdf", category: "Payment Receipt", uploadedAt: d(-4), uploadedBy: "Layla Hassan" },
    ],
    woExpenses: [
      { id: "we10", date: d(-22), category: "Port Charges", amount: 2600, vatPct: 5, vendorId: "s1", vendor: "PortEdge Services LLC", status: "Approved", by: "Rashid Khan" },
      { id: "we11", date: d(-21), category: "Toll", amount: 410, vatPct: 5, status: "Approved", by: "Bilal Ahmed" },
      { id: "we12", date: d(-20), category: "Miscellaneous", amount: 300, vatPct: 0, notes: "Escort permit", status: "Pending", by: "Rashid Khan" },
    ],
    invoice: { invoiceNo: "INV-2026-0002", date: d(-9), dueDate: d(21), subtotal: 41600, vatPct: 5, vatAmount: 2080, total: 43680, status: "Partial", generatedBy: "Layla Hassan" },
    invoiceNo: "INV-2026-0002", invoiceGeneratedAt: d(-9),
    payments: [{ id: "wp2", date: d(-4), amount: 20000, mode: "Cheque", reference: "CHQ-556781", receiptNo: "RCP-0002", by: "Layla Hassan" }],
    activityLog: [
      { id: "a17", at: d(-26), by: "Fatima Al Zaabi", action: "Work order created", department: "Sales" },
      { id: "a18", at: d(-9), by: "Layla Hassan", action: "Invoice generated", note: "INV-2026-0002", department: "Accounts" },
      { id: "a19", at: d(-4), by: "Layla Hassan", action: "Payment received", note: "AED 20,000 · Cheque", department: "Accounts" },
    ],
    createdAt: d(-26), createdBy: "Fatima Al Zaabi",
  },
];

export const seedShipments: Shipment[] = [
  { id: "sh1", shipmentNo: "SH-2026-0001", workOrderId: "w1", customerId: "c1", driverId: "dr1", truckId: "t1", pickup: "Jebel Ali Port, Dubai", delivery: "Al Quoz Warehouse", containers: 4, amount: 34000, stage: "Delivered", timeline: makeTimeline(8), docs: [], createdAt: d(-30), deliveredAt: d(-14) },
];

export const seedExpenses: Expense[] = [
  { id: "e1", date: d(-28), category: "Port Charges", amount: 1850, shipmentId: "sh1", vendor: "PortEdge Services LLC", status: "Approved" },
  { id: "e2", date: d(-26), category: "Toll Charges", amount: 320, shipmentId: "sh1", status: "Approved" },
  { id: "e3", date: d(-25), category: "Driver Expenses", amount: 450, shipmentId: "sh1", notes: "Food & lodging", status: "Approved" },
];

export const seedPurchases: Purchase[] = [
  { id: "p1", poNumber: "PO-0001", supplierId: "s2", date: d(-30), amount: 14500, items: "Diesel 2500L", status: "Paid", paidAmount: 14500 },
  { id: "p2", poNumber: "PO-0002", supplierId: "s1", date: d(-15), amount: 7800, items: "Port handling — Feb batch", status: "Approved", paidAmount: 0 },
];

export const seedInvoices: Invoice[] = [
  { id: "inv1", invoiceNo: "INV-2026-0001", customerId: "c1", shipmentId: "sh1", date: d(-14), dueDate: d(16), subtotal: 34000, taxPct: 5, total: 35700, paid: 35700, status: "Paid" },
  { id: "inv2", invoiceNo: "INV-2026-0002", customerId: "c5", date: d(-9), dueDate: d(21), subtotal: 41600, taxPct: 5, total: 43680, paid: 20000, status: "Partial" },
];

export const seedReceipts: Receipt[] = [
  { id: "r1", receiptNo: "RCP-0001", invoiceId: "inv1", customerId: "c1", date: d(-2), amount: 35700, mode: "Bank Transfer", reference: "NEFT-88123" },
  { id: "r2", receiptNo: "RCP-0002", invoiceId: "inv2", customerId: "c5", date: d(-4), amount: 20000, mode: "Cheque", reference: "CHQ-556781" },
];

export const seedJournal: JournalEntry[] = [
  { id: "j1", date: d(-14), type: "Journal", debitAccount: "Accounts Receivable", creditAccount: "Freight Income", amount: 34000, narration: "Invoice INV-2026-0001 raised" },
  { id: "j2", date: d(-2), type: "Contra", debitAccount: "Bank — Emirates NBD", creditAccount: "Cash in Hand", amount: 5000, narration: "Cash deposit" },
];
