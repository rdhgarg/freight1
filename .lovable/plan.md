
# HAMS Refactor — Work Order Driven ERP, UAE Standards

Refactor the existing app in place. Keep Phase 1 auth, layout, theme, RBAC, and shadcn components untouched. No visual redesign.

## 1. Global standards (AED + VAT)

- `src/lib/format.ts`: replace `inr(...)` with `aed(...)` returning `AED 1,250.00` (keep `inr` as a thin alias re-exporting `aed` so old imports don't break during migration).
- `src/lib/types.ts`:
  - `WorkOrder.currency` default `"AED"`, remove USD/EUR/INR options from UI defaults.
  - Rename `gst` → `trn` on `Customer` and `Vendor` (keep `gst` field readable for legacy localStorage, migrate on load).
  - Replace `taxPct` semantics with VAT (same field name kept for storage; UI labels only).
- Search/replace UI labels: "GST" → "VAT (TRN)", "₹" / `inr(` → `aed(`, "Truck" → "Fleet", "Supplier" → "Vendor".

## 2. Navigation & module surface

Update `src/components/app-sidebar.tsx` groups:

```
Dashboard
Operations
  - Work Orders
Masters
  - Vendors
  - Fleet
  - Drivers
Accounts
  - Invoices
  - Payments (Receipts)
  - Outstanding
Reports        (stub with Coming Soon, kept in nav)
Settings
  - Company, Users, Roles
```

Hide from sidebar (routes stay for compatibility): Customers, Shipments, Purchases, Expenses (moved inside WO), Ledgers, Journal.

## 3. Data model — Work Order as single source of truth

Extend `WorkOrder` in `src/lib/types.ts`:

```ts
operations: {
  deliveryOrderReceived: boolean; customClearance: boolean;
  containerAvailable: boolean; gatePass: boolean; portReady: boolean;
  remarks?: string;
}
assignment: { driverId?: string; fleetId?: string; assignedAt?: string; eta?: string; }
timeline: WOTimelineEvent[]  // stage, at, by, note
docs: WODoc[] (extended with category: "Delivery Order"|"Customs"|"Invoice"|"POD"|"Receipt"|"Other")
expenses: WOExpense[] (category, amount, vendor, receiptUrl, status, remarks)
invoice?: { invoiceNo; date; subtotal; vatPct; vatAmount; total; status; }
payments: WOPayment[] (date, mode, ref, amount)
activityLog: WOActivityLog[]
```

New `WorkOrderStatus` enum (sequential):

```
Draft → Operations Started → Driver Assigned → Reached Port →
Inspection → X-Ray → Container Picked → Out From Port →
Reached Delivery → Delivered → Invoice Generated →
Payment Pending → Payment Received → Closed
```

Legacy statuses map to closest new stage on load.

## 4. `src/stores/data.ts` — vendor-first + WO lifecycle actions

Add actions (all mutate the same WO, append to `activityLog` + `timeline`):

- `advanceWOStatus(id, nextStatus, by, note?)` — enforces sequential order (RBAC bypass allowed for Super Admin).
- `toggleWOOperation(id, key, by)`; auto-advance to "Operations Started" on first toggle.
- `assignDriverFleet(id, {driverId, fleetId, eta}, by)` → sets stage to "Driver Assigned".
- `addWODoc(id, doc)`, `removeWODoc(id, docId)`, `replaceWODoc`.
- `addWOExpense`, `approveWOExpense`, `removeWOExpense`.
- `generateWOInvoice(id, {vatPct}, by)` → creates invoice snapshot, stage → "Invoice Generated".
- `addWOPayment(id, payment, by)` → updates outstanding; when paid==total, stage → "Payment Received" then "Closed".
- Selectors: `woOutstanding(id)`, `woOpsCost(id)`, `vendorSummary(vendorId)` (WOs, invoices total, outstanding, payment history, on-time %).

Remove `generateShipmentFromWO` from happy path (keep function as no-op wrapper for legacy calls).

## 5. Work Order Details page (the workspace)

Rewrite `src/routes/_app.work-orders.$id.index.tsx` with 9 tabs, each fully interactive:

1. **Overview** — general info, vendor card (link), delivery + container info, current status, priority, assigned team, summary cards (Ops cost, Invoice total, Outstanding).
2. **Operations** — 5 checkbox tasks, remarks textarea, doc quick-upload, "Start Operations" button (transitions status).
3. **Driver Assignment** — driver select, fleet select, ETA date, save button, current assignment card, "Change" dialog. History rendered from activityLog filter.
4. **Live Timeline** — vertical timeline of `timeline` events with date/time/user/status badge/note; "Add event" quick-add for allowed stages.
5. **Documents** — grouped by category; upload (file → dataUrl), replace, delete; preview via `<a target=_blank>`.
6. **Expenses** — table + add-expense dialog (category, amount, vendor, receipt upload, remarks), approve/reject actions, total footer.
7. **Invoice** — if none: "Generate Invoice" (VAT % input, preview with subtotal/VAT/total in AED, mock download button that opens a printable window). Once generated: show invoice card + status.
8. **Payments** — payment history table, "Add Payment" dialog (date, mode, ref, amount), auto outstanding calc, receipt list.
9. **Activity Log** — full audit trail from `activityLog`.

Left column keeps compact status pipeline (14-step, horizontal scroll) + summary cards.

## 6. Work Order list & form

- `_app.work-orders.index.tsx`: replace customer column with vendor column; filters by new statuses; AED currency; quick-status advance from row menu.
- `_app.work-orders.new.tsx` + `.edit.tsx`: form uses vendor picker (required), removes customer requirement (keep optional legacy customer link hidden by default), VAT % field, AED currency label, port/terminal/container fields retained.

## 7. Vendor module

`_app.vendors.$id.index.tsx` — 7 tabs: Overview, Documents, Performance (on-time %, jobs count, avg value), Related Work Orders (list linked WOs), Outstanding (sum unpaid invoices), Invoices, Payment History. All computed from `vendorSummary`.

## 8. Dashboard

`_app.dashboard.tsx` — replace widgets with WO-driven KPIs:

- Today's Work Orders, Pending Operations, Drivers Assigned Today, Port Pending, Ready for Billing, Invoices Pending, Payments Pending, Completed WOs.
- Each card is a `<Link>` to `/work-orders?status=<value>` (list reads `status` search param).
- Financial cards in AED: Revenue, Outstanding, Expenses, Vendor Payments, Monthly Profit.
- Recharts remain but data derived from WOs.

## 9. Accounts

- `_app.invoices.tsx`: real list from all WO invoices; columns Invoice No, Vendor, Date, Total (AED), Paid, Outstanding, Status; row click → parent WO invoice tab.
- `_app.receipts.tsx` (rename UI to "Payments"): list from all WO payments; add-payment dialog links to WO.
- `_app.outstanding.tsx`: aging buckets computed from WO outstanding by vendor.

## 10. Removals / hides

- Sidebar: remove Shipments, Customers, Purchases, Expenses (standalone), Ledgers, Journal entries.
- Keep route files so deep links don't 404; show a small "moved into Work Orders" note where relevant.
- Do not delete Customer store/data (migration safety); simply stop surfacing it.

## 11. Migration / seed

- `src/lib/seed.ts`: convert amounts to AED-scale numbers, seed 8–10 WOs across statuses, with docs, expenses, invoices, payments populated so every tab has content.
- `stores/data.ts` `onRehydrate`: map old statuses/fields (`gst`→`trn`, currency→AED, add missing WO sub-arrays).

## 12. Interactivity guarantees

Every tab has: at least one action (button/dialog), one editable field, one destructive action (delete/reject where relevant). No `disabled` tabs, no ComingSoon inside WO details.

## Technical notes

- File uploads use `FileReader` → `dataUrl` stored in Zustand (localStorage-persisted); warn if >2MB.
- Status transitions call a shared `advanceWOStatus` helper that appends both `timeline` and `activityLog` entries with `by = currentUser.name` and `role = currentUser.role`.
- `aed()` uses `Intl.NumberFormat('en-AE', { style:'currency', currency:'AED' })`.
- Sequential status enforcement: only Super Admin can jump; others advance one step.
- Keep TanStack Router file-based routes; no route additions needed beyond existing WO detail.
